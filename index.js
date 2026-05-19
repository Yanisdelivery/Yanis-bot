const https=require('https');const http=require('http');
const IID='7107607381';
const ITOKEN='06df99fcaf654e6dbd0d504cf1413b60144f1c48ac824ea2b5';
const GROQ='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';
const GBASE='https://api.green-api.com';
const OWNER='212716508833@c.us';

function get(url){return new Promise(r=>{https.get(url,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r(null)}})}).on('error',()=>r(null))});}

function post(url,body,auth){return new Promise(r=>{const u=new URL(url);const b=Buffer.from(JSON.stringify(body));const h={'Content-Type':'application/json','Content-Length':b.length};if(auth)h['Authorization']=`Bearer ${auth}`;const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:h},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r({})}})});req.on('error',()=>r({}));req.write(b);req.end()});}

async function track(code){const d=await get(`https://yanisdelivery.site/track1.php?code=${code}`);return d&&d[0]?d[0]:null;}

function findCode(t){const m=t.match(/[A-Z]{2,5}-\d{2}-\d{2}-\d{4}-\d+/i);return m?m[0].toUpperCase():null;}

const STATUS={'Livré':'✅ وصل','Annulé':'❌ ملغي','En cours':'🚚 في الطريق','Retour':'↩️ راجع','En attente':'⏳ في الانتظار'};

async function reply(txt,info){
  const sys=`بوت Yanis Delivery. رد بالدارجة أو الفرنسية. جملتين مع إيموجي.${info?` طرد: حالة=${STATUS[info.Etat]||info.Etat} مدينة=${info.Ville} موزع=${info.Livreur} هاتف=${info.Telephone}`:''}`;
  const r=await post('https://api.groq.com/openai/v1/chat/completions',{model:'llama3-8b-8192',max_tokens:150,messages:[{role:'system',content:sys},{role:'user',content:txt}]},GROQ);
  return r.choices?.[0]?.message?.content||null;
}

async function send(id,msg){await post(`${GBASE}/waInstance${IID}/sendMessage/${ITOKEN}`,{chatId:id,message:msg});}

const server=http.createServer((req,res)=>{
  if(req.method==='POST'&&req.url==='/webhook'){
    let body='';
    req.on('data',c=>body+=c);
    req.on('end',async()=>{
      res.writeHead(200);res.end('OK');
      try{
        const d=JSON.parse(body);
        if(d.typeWebhook!=='incomingMessageReceived')return;
        const txt=d.messageData?.textMessageData?.textMessage||'';
        const cid=d.senderData?.chatId||'';
        const name=d.senderData?.senderName||'عميل';
        if(!txt||!cid.includes('@g.us'))return;
        console.log(`[${name}]: ${txt}`);
        const kw=['مزروب','عاجل','مشكل','مفقود'];
        if(kw.some(k=>txt.includes(k)))await send(OWNER,`🚨 ${name}: ${txt}`);
        const code=findCode(txt);
        const info=code?await track(code):null;
        const r=await reply(txt,info);
        if(r)await send(cid,r);
      }catch(e){console.error(e.message);}
    });
  }else{
    res.writeHead(200);res.end('Yanis Bot OK');
  }
});

server.listen(process.env.PORT||3000,()=>console.log('🚀 Bot OK'));
