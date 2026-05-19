const https=require('https');const http=require('http');
const UINSTANCE='instance176233';
const UTOKEN='cnurnc1zb5wduoa7';
const GROQ='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';
const OWNER='212716508833';
function get(url){return new Promise(r=>{https.get(url,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r(null)}})}).on('error',()=>r(null))});}
function post(url,body,auth){return new Promise(r=>{const u=new URL(url);const b=Buffer.from(JSON.stringify(body));const h={'Content-Type':'application/json','Content-Length':b.length};if(auth)h['Authorization']=`Bearer ${auth}`;const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:h},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r({})}})});req.on('error',()=>r({}));req.write(b);req.end()});}
async function track(code){const d=await get('https://yanisdelivery.site/track1.php?code='+code);return d&&d[0]?d[0]:null;}
function findCode(t){const m=t.match(/[A-Z]{2,5}-\d{2}-\d{2}-\d{4}-\d+/i);return m?m[0].toUpperCase():null;}
const ST={'Livré':'✅ وصل','Annulé':'❌ ملغي','En cours':'🚚 في الطريق','Retour':'↩️ راجع'};
async function ai(txt,info){const sys='بوت Yanis Delivery. رد بالدارجة أو الفرنسية. جملتين مع إيموجي.'+(info?' طرد: حالة='+(ST[info.Etat]||info.Etat)+' مدينة='+info.Ville+' موزع='+info.Livreur+' هاتف='+info.Telephone:'');const r=await post('https://api.groq.com/openai/v1/chat/completions',{model:'llama3-8b-8192',max_tokens:150,messages:[{role:'system',content:sys},{role:'user',content:txt}]},GROQ);return r.choices?.[0]?.message?.content||null;}
async function send(to,msg){await get('https://api.ultramsg.com/'+UINSTANCE+'/messages/chat?token='+UTOKEN+'&to='+encodeURIComponent(to)+'&body='+encodeURIComponent(msg)+'&priority=10');}
http.createServer((req,res)=>{
if(req.method==='POST'&&req.url==='/webhook'){let body='';req.on('data',c=>body+=c);req.on('end',async()=>{res.writeHead(200);res.end('OK');try{
const d=JSON.parse(body);
if(d.event_type!=='message_received')return;
const data=d.data||{};
const txt=data.body||data.message||'';
const from=data.from||data.chatId||'';
const isGroup=from.includes('@g.us')||data.isGroup===true||data.type==='group';
console.log('📨 from:'+from+' group:'+isGroup+' txt:'+txt);
if(!txt||!isGroup)return;
const kw=['مزروب','عاجل','مشكل','مفقود'];
if(kw.some(k=>txt.includes(k)))await send(OWNER,'🚨 '+from+': '+txt);
const code=findCode(txt);
const info=code?await track(code):null;
const r=await ai(txt,info);
if(r)await send(from,r);
}catch(e){console.error('❌',e.message);}});}
else{res.writeHead(200);res.end('Yanis Bot OK');}
}).listen(process.env.PORT||3000,()=>console.log('🚀 UltraMsg Bot OK'));
