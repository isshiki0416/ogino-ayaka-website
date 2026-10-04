const policies=[
['区政とつながる','声を届け、一緒に考える。身近な区政へ。','暮らしの中の疑問や困りごとを、区政につなげます。世代を超えて意見や知恵を持ち寄り、誰もが地域づくりに参加できる品川を目指します。','継続実施','区政報告会や毎月の茶話会を開催。教科書見学ツアー、タウンミーティング、勉強会、救急救命訓練など、区政を知り、意見を交わせる機会を重ねています。'],
['人とつながる','一人で抱え込まない、支え合える地域へ。','子育てや介護で困ったときに、相談できる人や必要な支援につながれることを大切にします。互いに気にかけ、助け合える地域を目指します。','現場訪問・相談対応','区内施設や商店街、ご相談・陳情の現場を徒歩や自転車で訪問。在宅育児への支援や介護認定の課題、介護従事者の処遇改善を取り上げています。'],
['地方とつながる','普段の交流を、いざというときの支えに。','地方との交流を、子どもたちの学びや災害への備えに生かします。食料の確保という視点も大切に、互いの地域を支える関係を育てます。','協定締結・事業拡充','2025年5月、福島県矢祭町との防災相互協定が締結。2026年5月には、ワーケーション促進事業の受け入れ先が矢祭町を含む11自治体に拡充されました。'],
['歴史とつながる','品川を知り、地域の文化を次の世代へ。','受け継がれてきた歴史や文化を知ることは、地域への愛着につながります。長く住む方も、新しく暮らす方も、品川の魅力に触れられる機会を届けます。','文化・教育に関する提案','伝統文化や環境を守る提案を行っています。関連する教育分野では、教育委員候補者と着任前に意見交換する機会の創設を提案し、採用されました。'],
['ご近所経済圏とつながる','人もお金も巡る、元気な商店街へ。','商店街は、買い物を支えるだけでなく、人と人が顔を合わせる場所。子どもが初めてのおつかいに出かけられるような、顔の見える地域を大切にします。','提言を継続','商店街振興組合への加入促進や子育て応援地域クーポンの創設を提言。再開発と地元商店の共存に向け、大井町周辺の人の流れや立会川暗渠の再整備も提言しています。']];
document.querySelector('#policy-list').innerHTML=policies.map((p,i)=>`<details class="policy-row" id="policy-${i+1}"><summary><b class="policy-no">0${i+1}</b><h3>${p[0]}</h3><div class="policy-caption">${p[1]}</div><span>＋</span></summary><div class="policy-body"><div><h4>目指していること</h4><p>${p[2]}</p></div><div><span class="tag">${p[3]}</span><p>${p[4]}</p></div></div></details>`).join('');
const menu=document.querySelector('.menu');menu.addEventListener('click',()=>{const open=document.querySelector('nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');menu.textContent=open?'×':'☰'});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));document.querySelectorAll('a[href^="#policy-"]').forEach(a=>a.addEventListener('click',()=>{document.querySelector(a.getAttribute('href')).open=true}));
const config=window.SITE_CONFIG||{};if(config.adobeFontsStylesheet){const l=document.createElement('link');l.rel='stylesheet';l.href=config.adobeFontsStylesheet;document.head.append(l)}
if(config.instagramUrl){document.querySelectorAll('.social-links a, .footer-social a').forEach(a=>{if(a.href.startsWith('https://www.instagram.com/')) a.href=config.instagramUrl;});}
// Familiar SNS marks, with visible text labels retained for accessibility.
const iconPaths={
 x:'<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.5 5.4 22H2.2l7.6-8.7L.8 2h6.5l4.5 6.8L18.9 2ZM17.8 20h1.7L6.3 3.9H4.5L17.8 20Z"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2"/>',
 facebook:'<path d="M14 22v-9h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5H18V3.8c-.4-.1-1.8-.2-3.1-.2-3 0-4.9 1.8-4.9 5V10H7v3h3v9h4Z"/>',
 blog:'<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7 7h10M7 11h10M7 15h5M7 18h8" fill="none" stroke="currentColor" stroke-width="1.7"/>'};
function socialIcon(key){const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('viewBox','0 0 24 24');el.setAttribute('class','sns-icon');el.setAttribute('aria-hidden','true');el.setAttribute('fill','currentColor');el.innerHTML=iconPaths[key];return el}
document.querySelectorAll('.social-links a,.footer-social a,[data-social]').forEach(el=>{const url=el.getAttribute('href')||'';const key=el.dataset.social||(url.includes('instagram.com')?'instagram':url.includes('x.com')?'x':url.includes('facebook.com')?'facebook':'blog');el.prepend(socialIcon(key))});

// Use Facebook's Page Plugin endpoint; regular Facebook page URLs cannot be framed.
const facebookHost=document.querySelector('#social-feed');
const facebookFrame=facebookHost.querySelector('iframe');
let lastFacebookWidth=0;
function resizeFacebookFeed(){
 const width=Math.min(500,Math.floor(facebookHost.getBoundingClientRect().width));
 if(width<180||width===lastFacebookWidth)return;
 lastFacebookWidth=width;
 const params=new URLSearchParams({href:facebookHost.dataset.facebookUrl,tabs:'timeline',width:String(width),height:'730',small_header:'false',adapt_container_width:'true',hide_cover:'true',show_facepile:'false'});
 facebookFrame.width=String(width);
 facebookFrame.src='https://www.facebook.com/plugins/page.php?'+params.toString();
}
resizeFacebookFeed();
let facebookResizeTimer;
if('ResizeObserver' in window){
 new ResizeObserver(()=>{clearTimeout(facebookResizeTimer);facebookResizeTimer=setTimeout(resizeFacebookFeed,150);}).observe(facebookHost);
}else{
 window.addEventListener('resize',resizeFacebookFeed);
}
