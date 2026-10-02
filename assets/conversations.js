/* Firebase conversation system: isolated so it never breaks the main page.
   Requires firebase-app-compat and firebase-firestore-compat to be loaded first. */
(function(){
  /* ======= Firebase Init ======= */
  var db, convCol, ready = false;
  try {
    /* TODO: Replace with your Firebase project config from https://console.firebase.google.com */
    firebase.initializeApp({
      apiKey: "AIzaSyAuMWXc_gR0NSKTpD16dqd2kPm7RexFi7s",
      authDomain: "cruator-wangchuyao.firebaseapp.com",
      projectId: "cruator-wangchuyao",
      storageBucket: "cruator-wangchuyao.firebasestorage.app",
      messagingSenderId: "69756796610",
      appId: "1:69756796610:web:0d7d33b38029a39e2e855b"
    });
    db = firebase.firestore();
    convCol = db.collection('conversations');
    ready = true;
  } catch(e) { console.warn('Firebase not available:', e); }

  /* Visitor token — persistent per browser via localStorage */
  var VK = 'curator_visitor_id', vid;
  try { vid = localStorage.getItem(VK); } catch(e){}
  if (!vid) {
    vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2,6);
    try { localStorage.setItem(VK, vid); } catch(e){}
  }

  /* Admin */
  /* TODO: Change to your own password */
  var ADMIN_PWD = 'curator';
  var isAdmin = false;

  /* Secret admin trigger: triple-click on modal title */
  var clickCount = 0, clickTimer = null;
  var titleEl = document.getElementById('convTitle');
  if (titleEl) {
    titleEl.style.cursor = 'default';
    titleEl.addEventListener('click', function() {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function(){ clickCount = 0; }, 600);
      if (clickCount >= 3) {
        clickCount = 0;
        document.getElementById('convAdminBar').style.display = 'flex';
      }
    });
  }

  /* FormSubmit email notification (reused from original) */
  var FS = '3d4627760930542d1dd6b9938358434d';
  function notifyEmail(t) {
    fetch('https://formsubmit.co/ajax/'+FS, {
      method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({message:t, _subject:'[新留言] curator.wangchuyao.com', _template:'box'})
    }).catch(function(){});
  }

  function esc(s) { var e=document.createElement('div'); e.textContent=s||''; return e.innerHTML; }
  function fmtTime(ts) {
    if(!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    var p = function(n){return n<10?'0'+n:n;};
    return d.getFullYear()+'/'+p(d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
  }

  /* ======= Load threads ======= */
  window.loadConversations = function() {
    var c = document.getElementById('convThreads');
    if (!ready) { c.innerHTML='<div class="conv-empty">留言服务未连接</div>'; return; }
    c.innerHTML='<div class="conv-loading">加载中…</div>';

    /* Admin sees ALL; visitor sees only own threads */
    var q = isAdmin
      ? convCol.orderBy('createdAt','desc').limit(50)
      : convCol.where('visitorId','==',vid).limit(20);

    q.get().then(function(snap){
      if(snap.empty){
        c.innerHTML = isAdmin
          ? '<div class="conv-empty">暂无留言</div>'
          : '<div class="conv-empty">发送留言后，策展人的回复将显示在此处</div>';
        return;
      }
      /* Sort visitor results client-side (newest first) */
      var docs = [];
      snap.forEach(function(doc){ docs.push(doc); });
      if (!isAdmin) {
        docs.sort(function(a,b){
          var ta = a.data().createdAt, tb = b.data().createdAt;
          if (!ta) return 1; if (!tb) return -1;
          return (tb.toDate ? tb.toDate() : new Date(tb)) - (ta.toDate ? ta.toDate() : new Date(ta));
        });
      }
      var h='';
      docs.forEach(function(doc){
        var d=doc.data();
        h+='<div class="conv-thread">';
        h+='<div class="conv-msg"><div class="conv-msg-text">'+esc(d.text)+'</div>';
        h+='<div class="conv-msg-meta">'+(isAdmin?'访客 · ':'')+fmtTime(d.createdAt)+'</div></div>';
        if(d.replies&&d.replies.length>0){
          d.replies.forEach(function(r){
            h+='<div class="conv-msg conv-msg-curator"><div class="conv-msg-label">策展人回复</div>';
            h+='<div class="conv-msg-text">'+esc(r.text)+'</div>';
            h+='<div class="conv-msg-meta">'+fmtTime(r.createdAt)+'</div></div>';
          });
        }
        if(isAdmin){
          h+='<div class="conv-reply-area">';
          h+='<textarea class="conv-reply-textarea" id="reply-'+doc.id+'" placeholder="回复此留言…"></textarea>';
          h+='<button class="conv-reply-send" onclick="convSendReply(\''+doc.id+'\')">回复</button>';
          h+='<button class="conv-reply-send" style="color:var(--text-muted);border-color:var(--border);float:left;" onclick="convDeleteThread(\''+doc.id+'\')">删除</button>';
          h+='<div style="clear:both"></div></div>';
        }
        h+='</div>';
      });
      c.innerHTML=h;
    }).catch(function(err){
      c.innerHTML='<div class="conv-empty">加载失败，请刷新重试</div>';
      console.error(err);
    });
  };

  /* ======= Send message ======= */
  window.convSendMsg = function() {
    var text=document.getElementById('convText').value.trim();
    var toast=document.getElementById('convToast');
    var btn=document.getElementById('convSendBtn');
    if(!text){toast.style.display='block';toast.textContent='请输入内容后再发送';return;}
    if(!ready){toast.style.display='block';toast.textContent='留言服务暂不可用';return;}
    btn.disabled=true; btn.textContent='发送中…';
    convCol.add({
      text:text, visitorId:vid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      replies:[]
    }).then(function(){
      toast.style.display='block'; toast.textContent='已发送，感谢您的建议';
      document.getElementById('convText').value='';
      notifyEmail(text);
      setTimeout(function(){toast.style.display='none';btn.disabled=false;btn.textContent='发送';closeConvModal();},1800);
    }).catch(function(err){
      toast.style.display='block'; toast.textContent='发送失败，请稍后再试';
      btn.disabled=false; btn.textContent='发送';
      console.error(err);
    });
  };

  /* ======= Admin reply ======= */
  window.convSendReply = function(docId) {
    var ta=document.getElementById('reply-'+docId);
    var text=ta?ta.value.trim():'';
    if(!text||!ready) return;
    convCol.doc(docId).update({
      replies: firebase.firestore.FieldValue.arrayUnion({text:text, createdAt:new Date().toISOString()})
    }).then(function(){ loadConversations(); }).catch(function(e){ console.error(e); });
  };

  /* ======= Admin delete ======= */
  window.convDeleteThread = function(docId) {
    if(!confirm('确认删除此对话？')) return;
    convCol.doc(docId).delete().then(function(){ loadConversations(); }).catch(function(e){ console.error(e); });
  };

  /* ======= Admin login ======= */
  window.convAdminLogin = function() {
    var pwd=document.getElementById('convAdminPwd').value.trim();
    if(pwd===ADMIN_PWD){
      isAdmin=true;
      window._convAdmin=true;
      document.getElementById('convAdminBar').innerHTML='<span class="conv-admin-status">策展人模式</span>';
      document.getElementById('convThreads').style.display='block';
      loadConversations();
    } else {
      document.getElementById('convAdminPwd').value='';
      document.getElementById('convAdminPwd').placeholder='密码错误';
    }
  };
})();
