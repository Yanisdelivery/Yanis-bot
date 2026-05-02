const https = require('https');
const http = require('http');
const INSTANCE_ID = '7107607381';
const INSTANCE_TOKEN = '06df99fcaf654e6dbd0d504cf1413b60144f1c48ac824ea2b5';
const API_BASE = `https://${INSTANCE_ID}.api.greenapi.com`;
const OWNER = '212716508833@c.us';
const KEYWORDS = ['مزروب','عاجل','urgent','مشكل','مفقود','رقم الموزع'];
const CITIES = 'مكناس:كل يوم|الخميسات:كل يوم|تيفلت:كل يوم|أزرو:الاثنين الأربعاء الجمعة|إفران:الاثنين الأربعاء الجمعة|بوفكران:الثلاثاء الخميس السبت|الحاجب:الثلاثاء الخميس السبت|سيدي قاسم:كل يوم|سيدي سليمان:كل يوم|سبعيون:كل يوم ما عدا الجمعة|أگوراي:الثلاثاء الجمعة|أيت يعزم:الثلاثاء الجمعة|مولاي إدريس:الأربعاء السبت|سبت جحجوح:الخميس|عين جيري:الخميس';
function post(url,body,hdrs){return new Promise((res,rej)=>{const u=new URL(url);const r=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{...hdrs,'Content-Length':Buffer.byteLength(body)}},(x)=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch{res({})}})});r.on('error',rej);r.write(body);r.end()});}
function get(url){return new Promise((res,rej)=>{https.get(url,(x)=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch{res({})}})}).on('error',rej)});}
function del(url){return new Promise((res)=>{const u=new URL(url);const r=https.request({hostname:u.hostname,path:u.pathname,method:'DELETE'},(x)=>{x.resume();x.on('end',()=>res())});r.on('error',()=>res());r.end()});}
async function ai(msg){const b=JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:`بوت Yanis Delivery. جدول التوصيل: ${CITIES}. رد بالدارجة أو الفرنسية حسب السؤال. إذا طلب رقم طرد قل سيتواصل معك المشرف. إذا سأل عن منطقة أعطه الأيام. جملتين فقط مع إيموجي.`,messages:[{role:'user',content:msg}]});return(await post('https://api.anthropic.com/v1/messages',b,{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY||'','anthropic-version':'2023-06-01'})).content?.[0]?.text||null;}
async function send(id,msg){await post(`${API_BASE}/waInstance${INSTANCE_ID}/sendMessage/${INSTANCE_TOKEN}`,JSON.stringify({chatId:id,message:msg}),{'Content-Type':'application/json'});}
async function run(){try{const d=await get(`${API_BASE}/waInstance${INSTANCE_ID}/receiveNotification/${INSTANCE_TOKEN}`);if(!d?.receiptId)return;await del(`${API_BASE}/waInstance${INSTANCE_ID}/deleteNotification/${INSTANCE_TOKEN}/${d.receiptId}`);if(d.body?.typeWebhook!=='incomingMessageReceived')return;const txt=d.body.messageData?.textMessageData?.textMessage||'';const cid=d.body.senderData?.chatId||'';const name=d.body.senderData?.senderName||'عميل';if(!txt||!cid.includes('@g.us'))return;console.log(`[${name}]: ${txt}`);if(KEYWORDS.some(k=>txt.includes(k))){await send(OWNER,`🚨 ${name}: ${txt}`);}const r=await ai(txt);if(r)await send(cid,r);}catch(e){console.error(e.message);}}
http.createServer((_,r)=>{r.writeHead(200);r.end('Yanis Bot OK');}).listen(process.env.PORT||3000,()=>{console.log('🚀 Bot running!');setInterval(run,5000);});
