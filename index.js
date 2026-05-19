const https=require('https');const http=require('http');
const IID='7107607381';const ITOKEN='06df99fcaf654e6dbd0d504cf1413b60144f1c48ac824ea2b5';
const GROQ='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';
const GBASE='https://api.green-api.com';const OWNER='212716508833@c.us';
const KW=['مزروب','عاجل','urgent','مشكل','مفقود','رقم الموزع'];
const CITIES='مكناس:كل يوم|الخميسات:كل يوم|تيفلت:كل يوم|أزرو:الاثنين الأربعاء الجمعة|إفران:الاثنين الأربعاء الجمعة|بوفكران:الثلاثاء الخميس السبت|الحاجب:الثلاثاء الخميس السبت|سيدي قاسم:كل يوم|سيدي سليمان:كل يوم|سبعيون:كل يوم ما عدا الجمعة|أگوراي:الثلاثاء الجمعة|أيت يعزم:الثلاثاء الجمعة|مولاي إدريس:الأربعاء السبت|سبت جحجوح:الخميس|عين جيري:الخميس';

function get(url){return new Promise((res)=>{https.get(url,(x)=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch{res(null)}})}).on('error',()=>res(null));});}
function post(url,body,hdrs){return new Promise((res)=>{const u=new URL(url);const b=Buffer.from(body);const r=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{...hdrs,'Content-Length':b.length}},(x)=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch{res({})}})});r.on('error',()=>res({}));r.write(b);r.end();});}

async function trackOrder(code){
  const data=await get(`https://yanisdelivery.site/track1.php?code=${encodeURIComponent(code)}`);
  if(!data||!data[0])return null;
  return data[0];
}

function extractCode(text){
  const match=text.match(/[A-Z]{2,5}-\d{2}-\d{2}-\d{4}-\d+/i);
  return match?match[0].toUpperCase():null;
}

async function ai(msg,trackInfo){
  const trackContext=trackInfo?`معلومات الطرد: الحالة=${trackInfo.Etat}, المدينة=${trackInfo.Ville}, الموزع=${trackInfo.Livreur}, الهاتف=${trackInfo.Telephone}`:'';
  const b=JSON.stringify({model:'llama3-8b-8192',messages:[{role:'system',content:`بوت Yanis Delivery. ${trackContext} جدول التوصيل: ${CITIES}. رد بالدارجة أو الفرنسية. جملتين فقط مع إيموجي. إذا كانت حالة الطرد Annulé قل ملغي، Livré قل وصل، En cours قل في الطريق.`},{role:'user',content:msg}]});
  const r=await post('https://api.groq.com/openai/v1/chat/completions',b,{'Content-Type':'application/json','Authorization':`Bearer ${GROQ}`});
  return r.choices?.[0]?.message?.content||null;
}

async function send(id,msg){await post(`${GBASE}/waInstance${IID}/sendMessage/${ITOKEN}`,JSON.stringify({chatId:id,message:msg}),{'Content-Type':'application/json'});}

async function run(){
  try{
    const d=await get(`${GBASE}/waInstance${IID}/receiveNotification/${ITOKEN}`);
    if(!d?.receiptId)return;
    await post(`${GBASE}/waInstance${IID}/deleteNotification/${ITOKEN}/${d.receiptId}`,'',{});
    if(d.body?.typeWebhook!=='incomingMessageReceived')return;
    const txt=d.body.messageData?.textMessageData?.textMessage||'';
    const cid=d.body.senderData?.chatId||'';
    const name=d.body.senderData?.senderName||'عميل';
    if(!txt||!cid.includes('@g.us'))return;
    console.log(`[${name}]:${txt}`);
    if(KW.some(k=>txt.includes(k)))await send(OWNER,`🚨 ${name}: ${txt}`);
    const code=extractCode(txt);
    let trackInfo=null;
    if(code){
      console.log('تتبع طرد:'+code);
      trackInfo=await trackOrder(code);
      console.log('نتيجة:',trackInfo);
    }
    const r=await ai(txt,trackInfo);
    if(r)await send(cid,r);
  }catch(e){console.error(e.message);}
}

http.createServer((_,r)=>{r.writeHead(200);r.end('Yanis Bot OK');}).listen(process.env.PORT||3000,()=>{console.log('🚀 Bot running!');setInterval(run,5000);});
