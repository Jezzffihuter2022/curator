/* Page code for curator.wangchuyao.com.
   Each section lives at its own path; this file renders the shared chrome
   (header, navigation, footer, modals) and the section named by
   <body data-page="..."> using the data in data.js. */

/* ---------- Sections and their paths ---------- */
const pages = [
  { key:"cabinet",    path:"/",                  label:"甄选珍奇" },
  { key:"gallery",    path:"/gallery/",          label:"藏品图览" },
  { key:"treasures",  path:"/orders-jewellery/", label:"勋章与珠宝" },
  { key:"regalia",    path:"/dress-couture/",    label:"礼服与华服" },
  { key:"chronicles", path:"/chronicles/",       label:"藏品札记" },
  { key:"departures", path:"/departures/",       label:"甄选出让" },
];
const pageByKey = Object.fromEntries(pages.map(p => [p.key, p]));
const currentPage = document.body.dataset.page || "cabinet";

const cabinetIntro = '多类精品并置于此，以数件勾勒整体';
const chroniclesIntro = '以器物解码<a class="group-link" href="#group-craft">审美</a>、<a class="group-link" href="#group-person">身份</a>与<a class="group-link" href="#group-power">权力</a>';
const curatorNote = '我对礼服、勋章与仪式器物的兴趣由来已久，到伦敦后才发现这些东西可以被实际收藏。通过这个网站，我把收藏的礼服、时装、勋章与珠宝放在同一视野中。当它们并置，审美趣味、制度等级与权力象征之间的关联会更容易被看见。器物不仅记录历史，也通过材质、造型和佩戴方式塑造观看者的判断。<br><br>这种呈现带有明确的个人取向。我偏爱承载密集历史与仪式感的器物，把制度性的威严转成可见、可感的视觉效果。一些有争议的历史符号，或许会被看成风格；某些沉重的等级秩序，也容易显得优雅。<br><br>因此，我想呈现的不只是器物本身，也包括观看它们的方式。它不试图给出标准答案，只保留一种仍在形成中的判断。';

const divider = '<div class="neo-divider section-after-divider"><div class="nd-line"></div><div class="nd-dot"></div><div class="nd-line"></div></div>';

function allItems() { return [...collection.regalia, ...collection.treasures]; }
function itemUrl(item) { return (item.id.startsWith("r") ? pageByKey.regalia : pageByKey.treasures).path + "#" + item.id; }
function articleUrl(id) { return pageByKey.chronicles.path + "#" + id; }

/* ---------- Shared chrome ---------- */
function renderChrome() {
  const hasDepartures = allItems().some(i => i.forSale);
  const nav = pages
    .filter(p => p.key !== "departures" || hasDepartures)
    .map(p => '<a class="tab-btn' + (p.key === currentPage ? ' active' : '') + '" href="' + p.path + '">' + p.label + '</a>')
    .join("");

  document.getElementById("site").innerHTML =
    '<header class="header">' +
      '<h1>汪楚尧 · 收藏与策展</h1>' +
      '<p class="header-subtitle">审美、身份与权力的器物叙事</p>' +
    '</header>' +
    '<nav class="tabs-container"><div class="tabs-bar">' + nav + '</div></nav>' +
    '<div class="main"><div class="tab-content" id="page"></div></div>' +

    '<div class="lightbox" id="lightbox" onclick="closeLightbox(event)">' +
      '<button class="lightbox-close" onclick="closeLightbox(event)">✕</button>' +
      '<button class="lightbox-nav lightbox-prev" id="lightboxPrev" onclick="event.stopPropagation();stepLightbox(-1)" aria-label="上一件">‹</button>' +
      '<button class="lightbox-nav lightbox-next" id="lightboxNext" onclick="event.stopPropagation();stepLightbox(1)" aria-label="下一件">›</button>' +
      '<img id="lightboxImg" src="" alt="">' +
      '<div class="lightbox-info"><div class="lightbox-title" id="lightboxTitle"></div><div class="lightbox-desc" id="lightboxDesc"></div>' +
        '<a id="lightboxArticleLink" href="#" style="display:none;margin-top:11px;padding:7px 20px;border:1px solid rgba(245,240,232,0.5);border-radius:2px;color:#F5F0E8;font-family:var(--serif);font-size:var(--fs-small);letter-spacing:2px;text-decoration:none;cursor:pointer;transition:background 0.2s;" onclick="event.stopPropagation()" onmouseover="this.style.background=\'rgba(245,240,232,0.1)\'" onmouseout="this.style.background=\'transparent\'">阅读札记</a>' +
      '</div>' +
    '</div>' +

    '<div class="article-modal" id="articleModal" onclick="closeArticle(event)">' +
      '<div class="article-modal-inner" onclick="event.stopPropagation()">' +
        '<button class="article-modal-close" onclick="closeArticle(event)">✕</button>' +
        '<div class="article-modal-title" id="articleTitle"></div>' +
        '<div class="article-modal-date" id="articleDate"></div>' +
        '<div id="articleImgContainer"></div>' +
        '<div class="article-modal-body" id="articleBody"></div>' +
        '<div id="articleItemLink"></div>' +
      '</div>' +
    '</div>' +

    '<footer class="footer">' +
      '<div class="neo-divider" style="margin-bottom:20px"><div class="nd-line"></div><div class="nd-dot"></div><div class="nd-line"></div></div>' +
      '<p>汪楚尧 <span class="en">Julian</span></p>' +
      '<p style="margin-top:10px"><button class="footer-note-link" onclick="openCuratorNote()">策展手记</button><span style="display:inline-block;width:2em;"></span><span class="footer-note-link" onclick="openConvModal();">留言与对话</span></p>' +
      '<p style="margin-top:8px">微信联系 <span class="en">LondonHKSZ</span></p>' +
      '<p><a href="https://curator.wangchuyao.com">curator.wangchuyao.com</a></p>' +
    '</footer>' +

    '<div class="curator-note-modal" id="curatorNoteModal" onclick="if(event.target===this||event.target.classList.contains(\'curator-note-modal-close\')){closeCuratorNote();}">' +
      '<button class="curator-note-modal-close">✕</button>' +
      '<div class="curator-note-modal-inner" onclick="event.stopPropagation()">' +
        '<div class="curator-note-modal-title">策展手记</div>' +
        curatorNote +
      '</div>' +
    '</div>' +

    '<div class="conv-modal" id="convModal" onclick="if(event.target===this)closeConvModal();">' +
      '<div class="conv-modal-inner" onclick="event.stopPropagation()">' +
        '<button class="conv-modal-close" onclick="closeConvModal()">✕</button>' +
        '<div class="conv-modal-title" id="convTitle">留言与对话</div>' +
        '<div class="conv-modal-intro">欢迎留下建议或意见，反馈将匿名发送至策展人</div>' +
        '<div class="conv-admin-bar" id="convAdminBar" style="display:none;">' +
          '<input class="conv-admin-input" id="convAdminPwd" type="password" placeholder="策展人入口">' +
          '<button class="conv-admin-btn" onclick="convAdminLogin()">进入</button>' +
        '</div>' +
        '<div class="conv-compose">' +
          '<textarea class="conv-textarea" id="convText" placeholder="请输入您的建议..."></textarea>' +
          '<button class="conv-send" id="convSendBtn" onclick="convSendMsg()">发送</button>' +
          '<div class="conv-toast" id="convToast"></div>' +
        '</div>' +
        '<div class="conv-threads" id="convThreads" style="display:none;"></div>' +
      '</div>' +
    '</div>';
}

/* ---------- Footer modals ---------- */
function openCuratorNote() { document.getElementById("curatorNoteModal").classList.add("open"); document.body.style.overflow = "hidden"; }
function closeCuratorNote() { document.getElementById("curatorNoteModal").classList.remove("open"); document.body.style.overflow = ""; }
function openConvModal() {
  document.getElementById("convModal").classList.add("open");
  document.body.style.overflow = "hidden";
  if (typeof loadConversations === "function" && window._convAdmin) loadConversations();
}
function closeConvModal() {
  document.getElementById("convModal").classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------- Helpers ---------- */
function parseYear(y) {
  if (!y || y === "当代") return 9999;
  const n = parseInt(y.replace("约", "").trim(), 10);
  return isNaN(n) ? 9999 : n;
}

function renderCard(item, index, hideTags) {
  const img = item.image ? '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">' : '<span class="item-placeholder">✦</span>';
  const tag = (!hideTags && item.forSale) ? '<span class="item-tag sale">可出让</span>' : '';
  return '<div class="item-card" style="animation:fadeIn 0.4s ease ' + (index * 0.06) + 's both" onclick="openLightbox(\'' + item.id + '\')">' +
    '<div class="item-image">' + img + '</div><div class="item-info"><div class="item-title">' + item.title + '</div>' +
    '<div class="item-meta"><span>' + (item.year || '') + '</span><span>' + (item.origin || '') + '</span>' + tag + '</div></div></div>';
}

/* ---------- Section renderers ---------- */
let filters = { regalia: [], treasures: [] };
let lightboxIds = [];   /* ids in the order the current page shows them */
let lightboxCurrent = null;

function renderCabinet() {
  const all = allItems();
  const featured = featuredIds.map(id => all.find(i => i.id === id)).filter(Boolean);
  lightboxIds = featured.map(i => i.id);
  document.getElementById("page").innerHTML =
    '<div class="section-header" style="padding-top:20px;padding-bottom:8px"><div class="section-title">甄选珍奇</div></div>' +
    '<div class="type-statement cabinet-intro">' + cabinetIntro + '</div>' +
    divider +
    '<div class="featured-grid">' + featured.map((i, n) => renderCard(i, n, true)).join("") + '</div>';
}

function renderCollection(key) {
  const items = collection[key] || [];
  const order = typeOrder[key] || [];
  const rawTypes = [...new Set(items.map(i => i.type))];
  const types = [...order.filter(t => rawTypes.includes(t)), ...rawTypes.filter(t => !order.includes(t))];
  const af = filters[key] || [];
  const filtered = af.length === 0 ? items : items.filter(i => af.includes(i.type));
  const sorted = [...filtered].sort((a, b) => parseYear(a.year) - parseYear(b.year));
  lightboxIds = sorted.map(i => i.id);
  const stmts = sectionStatements[key] || [];
  const sh = stmts.length > 0 ? '<div class="type-statement">' + stmts.join('<br>') + '</div>' : '';
  let fh = '';
  if (types.length > 1) {
    fh = '<div class="filter-bar"><button class="filter-btn ' + (af.length === 0 ? 'active' : '') + '" onclick="toggleFilter(\'' + key + '\',\'all\')">全部</button>' +
      types.map(t => '<button class="filter-btn ' + (af.includes(t) ? 'active' : '') + '" onclick="toggleFilter(\'' + key + '\',\'' + t + '\')">' + t + '</button>').join("") + '</div>';
  }
  document.getElementById("page").innerHTML =
    '<div class="section-header"><div class="section-title">' + pageByKey[key].label + '</div></div>' +
    sh + divider + fh +
    '<div class="featured-grid">' + sorted.map((i, n) => renderCard(i, n, false)).join("") + '</div>';
}

function articleDeck(a) {
  /* the objects an article is about, as "title · origin · year" */
  const linked = allItems().filter(i => i.articleLink === a.id).sort((x, y) => parseYear(x.year) - parseYear(y.year));
  if (linked.length === 0) return '';
  if (linked.length > 2) return linked.map(i => i.title).join('、');
  return linked.map(i => [i.title, i.origin, i.year].filter(Boolean).join(' · ')).join('；');
}

function renderChronicleRow(a) {
  const deck = articleDeck(a);
  return '<div class="chronicle-row" onclick="openArticle(\'' + a.id + '\')">' +
    '<div class="chronicle-row-title">' + a.title + '</div>' +
    (deck ? '<div class="chronicle-row-deck">' + deck + '</div>' : '') +
    '</div>';
}

function renderChronicles() {
  /* Articles are shown in three groups that follow the site's subtitle:
     aesthetics (craft), identity (persons) and power (institutions). */
  const grouped = chronicleGroups.map(g => ({ ...g, items: collection.chronicles.filter(a => a.group === g.key) })).filter(g => g.items.length > 0);
  const ungrouped = collection.chronicles.filter(a => !chronicleGroups.some(g => g.key === a.group));
  if (ungrouped.length > 0) grouped.push({ key: "other", label: "其他", statement: "", items: ungrouped });
  document.getElementById("page").innerHTML =
    '<div class="section-header"><div class="section-title">藏品札记</div></div>' +
    '<div class="type-statement">' + chroniclesIntro + '</div>' +
    divider +
    grouped.map(g =>
      '<section class="chronicle-group" id="group-' + g.key + '">' +
        '<div class="chronicle-group-title">' + g.label + '</div>' +
        (g.statement ? '<div class="chronicle-group-statement">' + g.statement + '</div>' : '') +
        '<div class="chronicle-list">' + g.items.map(a => renderChronicleRow(a)).join("") + '</div>' +
      '</section>'
    ).join("");
}

function renderDepartures() {
  const fs = allItems().filter(i => i.forSale);
  lightboxIds = fs.map(i => i.id);
  document.getElementById("page").innerHTML =
    '<div class="section-header"><div class="section-title">甄选出让</div></div>' +
    divider +
    '<div class="curator-statement" style="padding-bottom:16px">以下藏品可转让，欢迎通过页尾方式联系。</div>' +
    (fs.length > 0
      ? '<div class="featured-grid" style="padding-top:8px">' + fs.map((i, n) => renderCard(i, n, false)).join("") + '</div>'
      : '<div class="curator-statement" style="color:var(--text-muted)">暂无出让藏品</div>');
}

function renderGallery() {
  /* Every item's cover image, in a fresh random order on each visit. */
  const items = allItems().filter(i => i.image);
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  lightboxIds = items.map(i => i.id);
  document.getElementById("page").innerHTML =
    '<div class="gallery-grid" style="padding-top:var(--edge)">' +
      items.map(i => '<div class="gallery-item" onclick="openLightbox(\'' + i.id + '\')"><img src="' + i.image + '" alt="' + i.title + '" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>').join("") +
    '</div>';
}

function renderText() {
  /* /text/: every piece of site text in reading order, generated from data.js, for proofreading.
     Not linked from the navigation. Character counts exclude spaces and punctuation-free
     only in the sense of raw length, so they match the catalogue target (100-130). */
  const strip = h => h.replace(/<[^>]+>/g, '');
  const esc = t => (t || '');
  const count = t => strip(t).replace(/\s/g, '').length;
  const itemBlock = i => {
    const art = i.articleLink ? collection.chronicles.find(c => c.id === i.articleLink) : null;
    return '<div class="text-item" id="' + i.id + '"><div class="text-item-head"><span class="text-id">' + i.id + '</span>' +
      '<span class="text-title">' + i.title + '</span><span class="text-meta">' + [i.year, i.origin, i.type].filter(Boolean).join(' · ') + '</span></div>' +
      '<p class="text-desc">' + esc(i.description) + '<span class="text-count">' + count(i.description) + '</span></p>' +
      (art ? '<div class="text-link">札记：' + art.title + '</div>' : '') + '</div>';
  };
  const section = key => {
    const items = collection[key] || [];
    const order = typeOrder[key] || [];
    const types = [...order.filter(t => items.some(i => i.type === t)), ...[...new Set(items.map(i => i.type))].filter(t => !order.includes(t))];
    return '<h2 class="text-h2" id="sec-' + key + '">' + pageByKey[key].label + '</h2>' +
      '<p class="text-statement">' + (sectionStatements[key] || []).join('<br>') + '</p>' +
      types.map(t => '<h3 class="text-h3">' + t + '</h3>' +
        items.filter(i => i.type === t).sort((a, b) => parseYear(a.year) - parseYear(b.year)).map(itemBlock).join('')).join('');
  };
  const articleBlock = a => {
    const linked = allItems().filter(i => i.articleLink === a.id).sort((x, y) => parseYear(x.year) - parseYear(y.year));
    return '<div class="text-article" id="' + a.id + '"><div class="text-item-head"><span class="text-id">' + a.id + '</span>' +
      '<span class="text-title">' + a.title + '</span><span class="text-meta">' + (articleDeck(a) || '') + (a.date ? ' · ' + a.date : '') + '</span></div>' +
      '<div class="text-body">' + (a.excerpt || '') + '</div>' +
      (linked.length ? '<div class="text-link">藏品：' + linked.map(i => i.title).join('、') + '</div>' : '') +
      '<div class="text-count-line">' + count(a.excerpt || '') + ' 字</div></div>';
  };
  const groups = chronicleGroups.map(g => ({ ...g, items: collection.chronicles.filter(a => a.group === g.key) })).filter(g => g.items.length);
  const n = allItems().length, m = collection.chronicles.length;
  document.getElementById("page").innerHTML =
    '<div class="text-page">' +
    '<div class="section-header"><div class="section-title">全文</div></div>' +
    '<p class="text-note">本页由 data.js 自动生成，与站点同步：' + n + ' 件藏品著录，' + m + ' 篇札记。著录末尾的数字为字数。</p>' +
    '<p class="text-toc"><a href="#sec-intro">导语</a> · <a href="#sec-regalia">礼服与华服</a> · <a href="#sec-treasures">勋章与珠宝</a> · <a href="#sec-chronicles">藏品札记</a> · <a href="#sec-note">策展手记</a></p>' +
    '<h2 class="text-h2" id="sec-intro">导语</h2>' +
    '<p class="text-statement">首页：' + cabinetIntro + '</p>' +
    '<p class="text-statement">札记：' + strip(chroniclesIntro) + '</p>' +
    section("regalia") + section("treasures") +
    '<h2 class="text-h2" id="sec-chronicles">藏品札记</h2>' +
    groups.map(g => '<h3 class="text-h3">' + g.label + '</h3>' + g.items.map(articleBlock).join('')).join('') +
    '<h2 class="text-h2" id="sec-note">策展手记</h2><div class="text-body">' + curatorNote + '</div>' +
    '</div>';
}

function renderNotFound() {
  document.getElementById("page").innerHTML =
    '<div class="section-header"><div class="section-title">未找到页面</div></div>' +
    divider +
    '<div class="curator-statement">此地址下没有内容。各板块入口见上方导航，或<a class="inline-link" href="/">回到首页</a>。</div>';
}

function renderPage() {
  switch (currentPage) {
    case "cabinet": renderCabinet(); break;
    case "regalia": renderCollection("regalia"); break;
    case "treasures": renderCollection("treasures"); break;
    case "chronicles": renderChronicles(); break;
    case "departures": renderDepartures(); break;
    case "gallery": renderGallery(); break;
    case "text": renderText(); break;
    default: renderNotFound();
  }
}

function toggleFilter(k, v) { filters[k] = v === "all" ? [] : [v]; renderCollection(k); }

/* ---------- Deep links ---------- */
function setHash(id) { history.replaceState(null, "", id ? "#" + id : location.pathname + location.search); }

/* ---------- Lightbox ---------- */
function openLightbox(id) {
  const item = allItems().find(i => i.id === id);
  if (!item || !item.image) return;
  document.getElementById("lightboxImg").src = item.image.replace("_standard.jpg", "_large.jpg");
  document.getElementById("lightboxTitle").textContent = item.title || item.caption || '';
  document.getElementById("lightboxDesc").textContent = item.description || '';
  const linkEl = document.getElementById("lightboxArticleLink");
  if (item.articleLink) { linkEl.style.display = 'inline-block'; linkEl.href = articleUrl(item.articleLink); }
  else { linkEl.style.display = 'none'; }
  lightboxCurrent = id;
  const canStep = lightboxIds.length > 1 && lightboxIds.includes(id);
  document.getElementById("lightboxPrev").style.display = canStep ? 'block' : 'none';
  document.getElementById("lightboxNext").style.display = canStep ? 'block' : 'none';
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = 'hidden';
  setHash(id);
  fitLightbox();
}

/* Lay out the lightbox so that image, title, text and button share one screen. The text block is
   exactly as wide as the image. The image size is the same for every item on a given screen: it is
   computed once from the longest title and description in the collection, so that flipping through
   items never changes the image size; shorter texts simply leave a little room below. */
let lightboxFit = null;   /* { key, width } cached per viewport */
function fitLightbox() {
  const lb = document.getElementById("lightbox"), img = document.getElementById("lightboxImg"), info = lb.querySelector(".lightbox-info");
  if (!lb.classList.contains("open")) return;
  const ratio = RATIO_W_H;
  const cs = getComputedStyle(lb);
  const availH = lb.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const availW = lb.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const key = availW + "x" + availH;
  if (!lightboxFit || lightboxFit.key !== key) {
    /* measure the worst case: every item's title and description rendered at the candidate width, with the article button shown */
    const title = document.getElementById("lightboxTitle"), desc = document.getElementById("lightboxDesc"), link = document.getElementById("lightboxArticleLink");
    const saved = [title.textContent, desc.textContent, link.style.display];
    const items = allItems();
    link.style.display = "inline-block";
    const gap = parseFloat(getComputedStyle(info).marginTop) || 0;
    const tallest = () => items.reduce((m, i) => { title.textContent = i.title; desc.textContent = i.description || ""; return Math.max(m, info.offsetHeight); }, 0);
    const minW = Math.round(Math.min(availW, availH * ratio) * 0.58);
    let width = Math.min(availW, Math.round((availH - gap) * ratio));
    for (let i = 0; i < 12; i++) {
      info.style.width = width + "px";
      const h = Math.min(availH - gap - tallest() - 3, window.innerWidth <= 640 ? availH : availH * 0.78);   /* 3 px: rounding safety */
      const w = Math.max(minW, Math.min(availW, Math.round(h * ratio)));
      if (Math.abs(w - width) < 2) break;
      width = w;
    }
    title.textContent = saved[0]; desc.textContent = saved[1]; link.style.display = saved[2];
    lightboxFit = { key, width };
  }
  const width = lightboxFit.width;
  img.style.width = width + "px"; img.style.height = Math.round(width / ratio) + "px"; img.style.maxHeight = "none"; img.style.maxWidth = "none";
  info.style.width = width + "px";
}
const RATIO_W_H = 3 / 4;   /* every standard and large image is 3:4 */
window.addEventListener("resize", () => { lightboxFit = null; fitLightbox(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { lightboxFit = null; fitLightbox(); });

/* Move to the previous (-1) or next (+1) item of the current page, wrapping round. */
function stepLightbox(d) {
  const i = lightboxIds.indexOf(lightboxCurrent);
  if (i < 0) return;
  openLightbox(lightboxIds[(i + d + lightboxIds.length) % lightboxIds.length]);
}

function closeLightbox(e) {
  if (e.target === document.getElementById("lightbox") || e.target.classList.contains('lightbox-close')) {
    document.getElementById("lightbox").classList.remove("open"); document.body.style.overflow = '';
    setHash("");
  }
}

/* ---------- Article modal ---------- */
function openArticle(id) {
  const a = collection.chronicles.find(c => c.id === id); if (!a) return;
  const container = document.getElementById("articleImgContainer");
  const imgEl = src => '<img src="' + src + '" alt="" loading="lazy">';
  const imgs = [a.image, a.image2, a.image3, a.image4, a.image5, a.image6].filter(Boolean);
  if (a.imageLayout === "stack") {
    container.innerHTML = '<div class="article-img-stack">' + imgs.slice(0, 2).map(imgEl).join('') + '</div>';
  } else if (a.imageLayout === "side") {
    container.innerHTML = '<div class="article-img-side">' + imgs.slice(0, 2).map(imgEl).join('') + '</div>';
  } else if (a.imageLayout === "grid4") {
    container.innerHTML = '<div class="article-img-grid4">' + imgs.slice(0, 4).map(imgEl).join('') + '</div>';
  } else if (a.imageLayout === "grid6") {
    container.innerHTML = '<div class="article-img-grid6">' + imgs.map(imgEl).join('') + '</div>';
  } else if (a.imageLayout === "grid3left") {
    container.innerHTML = '<div class="article-img-grid3left">' +
      '<div class="article-img-grid3left-main">' + imgEl(a.image) + '</div>' +
      '<div class="article-img-grid3left-stack">' + imgs.slice(1, 3).map(imgEl).join('') + '</div>' +
    '</div>';
  } else if (a.image) {
    container.innerHTML = '<img class="article-modal-img" src="' + a.image + '" alt="">';
  } else {
    container.innerHTML = '';
  }
  document.getElementById("articleTitle").textContent = a.title;
  document.getElementById("articleDate").textContent = "";
  document.getElementById("articleBody").innerHTML = a.excerpt;

  /* Items that point to this article (via articleLink) are listed back here. */
  const linked = allItems().filter(i => i.articleLink === id).sort((x, y) => parseYear(x.year) - parseYear(y.year));
  document.getElementById("articleItemLink").innerHTML = linked.length === 0 ? '' :
    '<div class="article-item-link">' +
      '<div class="article-item-link-label">查看藏品</div>' +
      linked.map(i => '<div class="article-item-link-name"><a href="' + itemUrl(i) + '">↗ ' + i.title + '</a></div>').join('') +
    '</div>';

  document.getElementById("articleModal").classList.add("open");
  document.body.style.overflow = "hidden";
  setHash(id);
}

function closeArticle(e) {
  if (e.target === document.getElementById("articleModal") || e.target.classList.contains("article-modal-close")) {
    document.getElementById("articleModal").classList.remove("open"); document.body.style.overflow = "";
    setHash("");
  }
}

/* Open whatever the URL hash names, if it belongs to this page. */
function openFromHash() {
  const id = location.hash.replace("#", "");
  if (!id || id.startsWith("group-")) return;
  if (currentPage === "chronicles" && collection.chronicles.some(c => c.id === id)) { openArticle(id); return; }
  const item = allItems().find(i => i.id === id);
  if (!item) return;
  const here = currentPage === "gallery" ||
    currentPage === (item.id.startsWith("r") ? "regalia" : "treasures") ||
    (currentPage === "departures" && item.forSale);
  if (here) openLightbox(id);
}

window.addEventListener("hashchange", openFromHash);
document.addEventListener("keydown", e => {
  const lb = document.getElementById("lightbox"), am = document.getElementById("articleModal");
  if (lb.classList.contains("open") && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { stepLightbox(e.key === "ArrowLeft" ? -1 : 1); return; }
  if (e.key !== "Escape") return;
  if (lb.classList.contains("open")) closeLightbox({ target: lb });
  if (am.classList.contains("open")) closeArticle({ target: am });
  if (document.getElementById("curatorNoteModal").classList.contains("open")) closeCuratorNote();
  if (document.getElementById("convModal").classList.contains("open")) closeConvModal();
});

Object.assign(window, { openLightbox, closeLightbox, stepLightbox, openArticle, closeArticle, toggleFilter,
  openCuratorNote, closeCuratorNote, openConvModal, closeConvModal });

renderChrome();
renderPage();
openFromHash();
