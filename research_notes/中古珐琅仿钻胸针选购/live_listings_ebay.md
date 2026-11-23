# Live eBay Listings: Vintage Signed Enamel + Rhinestone Brooches (buyer in mainland China)

Research date: 2026-11-23 (session time, around 09:00 UTC). Researcher scope: currently active eBay listings (ebay.com primarily; ebay.co.uk/.de/.fr secondary).

**CRITICAL STATUS NOTE FOR THE REPORT WRITER: ZERO listings could be verified as active.** Every attempt to open an eBay listing or search page from this research environment was blocked. As a result:
- The "verified live listings" main list is **empty**. No listing below may be presented to the buyer as confirmed live or purchasable.
- Every listing below comes from **web-search result titles/snippets only**. The snippet details (price, condition) are summaries the search engine generated from indexed copies of the pages, which may be weeks or months old. They are not readings of the live page.
- Seller feedback, return policy, auction end time and ship-to-China status could **not** be seen for **any** item. All are "not verified".

## Which active listings match? (verification attempts and access results)

### Takeaway
No listing could be opened, so none can be confirmed active. eBay returned HTTP 403 "Error Page | eBay" for www.ebay.com, ebay.co.uk and ebay.de item pages, for search pages, and for the `?nordt=true` and `?_ul=US` URL variants. m.ebay.com redirected to an eBay bot-challenge page (`/splashui/challenge`), which I did not try to get past. The candidates below are unverified snippet-only leads. The buyer, or a researcher with a normal browser, must open each one to confirm it is live.

### Cited Findings
Access attempts, all made 2026-11-23:
- `https://www.ebay.com/sch/i.html?_nkw=corocraft+sterling+enamel+rhinestone+brooch` returned HTTP 403 by curl and by the WebFetch tool.
- `https://www.ebay.com/itm/135566700516`, the same URL with `?nordt=true` or `?_ul=US`, `https://www.ebay.co.uk/itm/135566700516` and `https://www.ebay.de/itm/135566700516` all returned HTTP 403. `https://www.ebay.co.uk/itm/358068186529` returned 403 via WebFetch.
- `https://m.ebay.com/itm/135566700516` returned 307, redirecting to `https://www.ebay.com/splashui/challenge?...` (a bot/CAPTCHA challenge). I did not attempt it.
- eBay's description sub-domain (`itm.ebaydesc.com/itmdesc/{id}`) returned 200, but only a script shell with no seller description text and no listing-status data, so it cannot confirm active status.
- Using third-party scraping proxies to get around eBay's block was not attempted. That route was blocked by the environment's permission policy, and it would circumvent eBay's access controls in any case.

#### Unverified (snippet only): candidates that may match all criteria (signed, vintage, enamel + rhinestone, within budget)
Prices are as reported in search snippets, not verified, and may be stale. "Ships to China": not verified for all items. Seller feedback, returns and end time: not verified for all items.

| # | URL | Maker / signature (per title/snippet) | Snippet details | Enamel + rhinestone in title/snippet? | Flags |
|---|---|---|---|---|---|
| 1 | https://www.ebay.com/itm/167179223779 | Crown Trifari, gold-tone "Fleurette" flower | ~US$80.99 Buy It Now; seller notes minor gold wear on one spot on back, no missing stones | Yes, both in title | Within the ≤$150 preference. Fleurette is a 1950s-60s Trifari line (era not in snippet) |
| 2 | https://www.ebay.com/itm/254197803746 | Trifari crown mark, monkey figural | ~US$129.99 or Best Offer; condition not stated in snippet | Yes, "Enameled & Rhinestone" in title | Within ≤$150 |
| 3 | https://www.ebay.com/itm/314939359579 | Trifari, black enamel, gold-tone | ~US$26 per snippet | Yes, "Enamel Brooch Rhinestones" in title | Title does not say "Crown". One snippet called it 1940s, which is unconfirmed. Low price is worth checking |
| 4 | https://www.ebay.com/itm/226072699097 | Crown Trifari fleur-de-lis | ~US$119 or Best Offer; "excellent condition"; green center cabochon | Enamel yes. **Rhinestone not confirmed** (a cabochon is not a rhinestone) | May fail the rhinestone criterion |
| 5 | https://www.ebay.com/itm/388358673047 | Crown Trifari fish, white enamel, 1950s; crown hallmark, item no. E1108 | ~US$49 | Enamel yes; **rhinestone not stated** | Check photos for a rhinestone eye |
| 6 | https://www.ebay.com/itm/396114373843 | KJL Kenneth Jay Lane, "signed", cat figural, multicolor enamel and rhinestones, ~2.15 in | ~US$69.99; good pre-owned | Yes | Era not stated. Check whether it is a vintage KJL mark (©K.J.L. 1960s-70s) or later/Avon |
| 7 | https://www.ebay.com/itm/144425864471 | KJL "Atlantis" nautilus, gold-tone, coral and black enamel, rhinestones | ~US$199.99 or Best Offer; small peeling spot on a faux pearl | Yes | Above the $150 preference but under the $230 ceiling. Era not stated |
| 8 | https://www.ebay.com/itm/128091872488 | K.J.L. green and blue enamel flower | ~US$199.99; pre-owned | Yes | Above the $150 preference |
| 9 | https://www.ebay.com/itm/126807922037 | KJL oak leaves and flower | ~US$24.99 or Best Offer; pre-owned | Yes | Era unknown; could be a later piece |
| 10 | https://www.ebay.com/itm/236162229215 | "KJL marked" red lipstick | ~US$90.72 or Best Offer; 2.75 in | Yes | **Era doubt**: novelty lipstick designs are more typical of later (1990s-2000s) KJL. Likely fails the pre-1990 rule unless the mark proves otherwise |
| 11 | https://www.ebay.com/itm/395342472744 | Hattie Carnegie Rudolph reindeer | ~US$100 or Best Offer | Yes, "Faux Rhinestone & ENAMEL" in title | Signature not confirmed in snippet |
| 12 | https://www.ebay.com/itm/116421139958 | Hattie Carnegie toucan, molded Lucite, enamel, rhinestone | Buy It Now; price not in snippet | Yes | Signature not confirmed in snippet |
| 13 | https://www.ebay.com/itm/323864892095 | Boucher frog; snippet says signed "Boucher" and numbered, green enamel, paste eyes | Price not in snippet | Enamel yes; "paste" (rhinestone) eyes | Good Boucher figural candidate if live |
| 14 | https://www.ebay.com/itm/116711165524 | Eisenberg, gold-tone, stamped back | Price not in snippet | Yes, "enamel rhinestone" in title | Check which Eisenberg mark it carries (Eisenberg Ice block-letter marks are 1970s+) |
| 15 | https://www.ebay.com/itm/188348046847 | Coro Craft Sterling pink flower | ~US$49 per snippet; rhinestone listed as material | **Enamel not confirmed** in snippet | Check photos |

#### Unverified (snippet only): candidates that FAIL criteria or appear ended
- https://www.ebay.com/itm/135566700516: "Rare Vintage Sterling Silver CORO CRAFT Blue Enamel & Rhinestone Flower Brooch", ~US$45. The snippet said "out of stock", so it is probably sold.
- https://www.ebay.com/itm/358068186529: "Vintage, Coro Craft, Sterling Silver, Blue rhinestone, Enamel 60's brooch", **sold** for US$19 per the snippet, so it has ended.
- https://www.ebay.com/itm/397415953596: KJL for Avon enamel rhinestone dragonfly, **sold** for US$10 per the snippet. It is also an Avon licence piece (later era).
- https://www.ebay.com/itm/144643555268: Coro Craft sterling enamel rhinestone "Flamenco" mother and son, ~US$785. **Over the ceiling.**
- https://www.ebay.com/itm/157621804233: 1942 Corocraft vermeil sterling enamel harpist, signed Corocraft and Sterling, ~US$1,149.95. **Over the ceiling.**
- https://www.ebay.com/itm/305466658419: 1940s Trifari butterfly, enameled, ~US$279. **Over the ceiling**; rhinestone not confirmed.
- https://www.ebay.com/itm/255505072050: 1940s Trifari Alfred Philippe bird of paradise, rhinestone, ~US$1,349.95. **Over the ceiling**; no enamel mentioned.
- https://www.ebay.com/itm/291576410557: listing titled "**Unsigned** Hattie Carnegie Enamel Rhinestone Bird". Unsigned, so it fails the criterion and the attribution is doubtful.
- https://www.ebay.com/itm/236837075697 (Crown Trifari clover, ~US$39) and https://www.ebay.com/itm/135785160583 (Crown Trifari rhinestone, ~US$25): **no enamel**.
- https://www.ebay.com/itm/334816600234 (Crown Trifari enamel with tag) and https://www.ebay.com/itm/203879721260 (Crown Trifari enamel dolphin): **rhinestone not stated**.
- https://www.ebay.com/itm/126993790258: Boucher "Marboux" white enamel flower. Per the snippet, the signature is partly faded with the "x" missing. Rhinestones not stated.
- https://www.ebay.com/itm/176680963291 and https://www.ebay.com/itm/183819944810 (Hattie Carnegie elephant at ~US$149.99, and black rhinestone floral): **rhinestone only**, no enamel stated. The floral has chips in a navette stone per the snippet.
- https://www.ebay.com/itm/376074704557: Christian Dior by Kramer brooch and earring set, rhinestone. Enamel not stated; price not in snippet.
- Snippets also mentioned a "Vintage Christian Dior Black Enamel Pave Rhinestones Gecko Lizard Pin Brooch" at ~US$148.99 and a "KRAMER SIGNED VINTAGE ENAMELED FLOWER BROOCH-ORANGE & RHINESTONES" at ~US$23, and a Hobé yellow enamel and rhinestone flower with a ~US$6.50 bid. These appeared only on eBay category or shop pages, with no item URLs returned, so they cannot be cited by item number. Snippet source: [eBay Dior Brooch category](https://www.ebay.com/b/Dior-Brooch/262004/bn_7023241038). **Era doubt on the Dior gecko**: pavé enamel gecko pins are typical of later Dior production.

Search sources: results came from WebSearch queries for "ebay Corocraft sterling enamel rhinestone brooch", "ebay Crown Trifari enamel rhinestone brooch vintage", "ebay Hattie Carnegie enamel rhinestone brooch", "ebay Boucher enamel rhinestone brooch signed", "ebay KJL Kenneth Jay Lane enamel rhinestone brooch", "ebay Trifari sterling enamel rhinestone brooch 1940s", "ebay Eisenberg OR Mazer OR Jomaz OR Reja ...", and "ebay Christian Dior Germany OR YSL OR Hobe OR Kramer ...". Each item URL above is the source link returned by those searches.

Category and shop pages that are useful starting points for manual browsing (all unverified, and blocked for fetching):
- [Jomaz Signed Vintage Brooches](https://www.ebay.com/b/Jomaz-Signed-Fashion-Vintage-Antique-Brooches-Pins/262004/bn_57670222). The search summary reported Jomaz enamel and rhinestone peacocks, tigers and owls at ~US$35-185.
- [Kenneth Jay Lane Enamel Brooches](https://www.ebay.com/b/Kenneth-Jay-Lane-Enamel-Fashion-Brooches-Pins/50677/bn_29618341)
- [Hattie Carnegie Vintage Brooches](https://www.ebay.com/b/Hattie-Carnegie-Fashion-with-Vintage-Vintage-Antique-Brooches-Pins/262004/bn_81137925)
- [Marcel Boucher Brooches](https://www.ebay.com/b/Marcel-Boucher-In-Vintage-Designer-Costume-Pins-Brooches/262004/bn_7022468655)
- [Kramer Signed Vintage Brooches](https://www.ebay.com/b/kramer-Fashion-Signed-Vintage-Antique-Brooches-Pins/262004/bn_97011336)
- [Corocraft Sterling shop page](https://www.ebay.com/shop/corocraft-sterling?_nkw=corocraft+sterling)

### Inferences
- The most budget-friendly and criteria-complete leads are #1 (Crown Trifari Fleurette, ~$81), #2 (Trifari monkey, ~$130), #6 (KJL cat, ~$70), #13 (Boucher frog) and #11 (Hattie Carnegie reindeer, ~$100). Each needs live confirmation.
- Corocraft sterling enamel and rhinestone pieces seen in snippets were either sold (the cheap ones, $19-45) or far over budget ($785-1,150). This suggests sub-$230 Coro Craft sterling enamel figurals are scarce and sell quickly, which fits the snippet evidence of quick sales.
- Snippet prices are search-index summaries and may be outdated. Expect some of these listings to have ended.

### Gaps
- **Active status of every listing is unverified** because eBay blocked access (403 or bot challenge).
- Auction end times, current bids, seller feedback score and percentage, and return policies could not be seen for any item.
- No Mazer/Jomaz sterling, Reja sterling, YSL, Givenchy, Butler & Wilson, Ciner, Hobé (with an item URL), Weiss, or Christian Dior Germany (Henkel & Grosse) enamel and rhinestone item URL surfaced in search. Reja returned no results at all.
- ebay.co.uk, .de and .fr item-level results did not surface in searches, and those domains were also blocked (403).

## Does the description confirm both enamel and rhinestones and a visible signature?

### Takeaway
I could not confirm this from any listing description, because the pages could not be opened. Enamel and rhinestone confirmation in the table above comes only from listing titles and search snippets. Signature confirmation exists in snippet text for only a few items (Boucher frog, "signed and numbered"; KJL cat, "signed"; Trifari fish, "crown hallmark E1108"; Corocraft harpist, "signed Corocraft and Sterling", over budget).

### Cited Findings
- The Crown Trifari fish snippet reports a crown hallmark and item number E1108 — [eBay 388358673047](https://www.ebay.com/itm/388358673047)
- The Boucher frog title reads "Boucher Frog Brooch Enamel Paste Signed" — [eBay 323864892095](https://www.ebay.com/itm/323864892095)
- The Boucher Marboux snippet says the signature is partly faded, with the "x" missing — [eBay 126993790258](https://www.ebay.com/itm/126993790258)
- A Hattie Carnegie listing is explicitly titled "Unsigned" — [eBay 291576410557](https://www.ebay.com/itm/291576410557)
- The eBay item-description endpoint (`itm.ebaydesc.com`) returned no description text for item 135566700516 (tested 2026-11-23).

### Inferences
- Titles like "Enamel & Rhinestone" are strong but not conclusive. The buyer should check the photos for a clear mark (for example the Crown-over-T Trifari mark, the Coro Craft Pegasus, "HATTIE CARNEGIE" in a cartouche, or Boucher's model number) and confirm the stones are rhinestones rather than cabochons.

### Gaps
- Full descriptions, photos of the signature, and condition details (enamel chips, replaced stones, plating wear) were not visible for any listing.

## Is there any evidence about shipping to China?

### Takeaway
None. Shipping and "ships to / excluded locations" sections could not be seen for any listing. Every item's ship-to-China and eBay International Shipping status is **not verified**.

### Cited Findings
- No shipping data was obtainable, because all item pages returned HTTP 403 or redirected to a bot challenge (access log above, 2026-11-23).

### Inferences
- The buyer must check each listing's "Shipping, returns & payments" section with the delivery country set to China. Many US sellers using eBay International Shipping do list China, but this cannot be assumed per listing.

### Gaps
- Ship-to-China status, international shipping cost and import-charge estimates are unknown for every candidate.
