const https=require('https');const http=require('http');
const UINSTANCE='instance176233';
const UTOKEN='cnurnc1zb5wduoa7';
const GROQ=process.env.GROQ_API_KEY;
const OWNER='212716508833';
function get(url){return new Promise(r=>{https.get(url,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r(null)}})}).on('error',()=>r(null))});}
function post(url,body,auth){return new Promise(r=>{const u=new URL(url);const b=Buffer.from(JSON.stringify(body));const h={'Content-Type':'application/json','Content-Length':b.length};if(auth)h['Authorization']='Bearer '+auth;const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:h},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r({})}})});req.on('error',()=>r({}));req.write(b);req.end()});}
async function send(to,msg){return new Promise(r=>{const u=new URL('https://api.ultramsg.com/'+UINSTANCE+'/messages/chat');const b=Buffer.from('token='+UTOKEN+'&to='+encodeURIComponent(to)+'&body='+encodeURIComponent(msg)+'&priority=10');const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':b.length}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{console.log('📤 '+d.substring(0,80));r(d)})});req.on('error',e=>{console.error('send err:'+e.message);r(null)});req.write(b);req.end()});}
async function track(code){const d=await get('https://yanisdelivery.site/track1.php?code='+code);return d&&d[0]?d[0]:null;}
function findCode(t){
  const patterns=[/[A-Z]{2,6}\d{6,12}[A-Z]{0,4}/i,/[A-Z]{2,5}-\d{2}-\d{2}-\d{4}-\d+/i,/[A-Z]{2,5}-\d{8,}-\d+/i,/\b\d{4,10}\b/];
  for(const p of patterns){const m=t.match(p);if(m)return m[0].toUpperCase();}
  return null;
}
const ST={
  'Livré':'wslat ✅',
  'Annulé':'mlghiya ❌',
  'En cours':'f triq 🚚',
  'Retour':'raja3at ↩️',
  'En attente':'kattsna ⏳',
  'Reporté':'m2ajala 📅',
  'Reporte':'m2ajala 📅',
  'Sorti':'khrajat 🚴'
};
const CONTACT_KW=['تواصل مع الكليان','تواصلو مع الكليان','سوني لكليان','صوني لكليان','العميل كيتسنى','client kaytsna','appel client','contactez le client','soni l client','sawni l client'];
function buildReply(info,code){
  const etat=ST[info.Etat]||info.Etat;
  return `Colis dyalk ${code} ${etat} 📦\n3and: ${info.Livreur} f ${info.Ville}\nTél: ${info.Telephone} 📞`;
}
http.createServer((req,res)=>{
  if(req.method==='POST'&&req.url==='/webhook'){
    let body='';
    req.on('data',c=>body+=c);
    req.on('end',async()=>{
      res.writeHead(200);res.end('OK');
      try{
        const d=JSON.parse(body);
        if(d.event_type!=='message_received')return;
        const data=d.data||{};
        const txt=data.body||data.message||'';
        const from=data.from||data.chatId||'';
        const isGroup=from.includes('@g.us')||data.isGroup===true;
        if(!txt||!isGroup)return;
        console.log('📨 '+txt);

        // تنبيه عاجل
        const kw=['مزروب','عاجل','urgent','مشكل','مفقود'];
        if(kw.some(k=>txt.toLowerCase().includes(k.toLowerCase()))){
          await send(OWNER,'🚨 تنبيه!\nرسالة: '+txt);
        }

        const code=findCode(txt);
        const info=code?await track(code):null;

        // تواصل مع العميل
        const needsContact=CONTACT_KW.some(k=>txt.toLowerCase().includes(k.toLowerCase()));
        if(needsContact&&info&&info.Telephone){
          const livreurPhone='212'+info.Telephone.replace(/^0/,'');
          await send(livreurPhone+'@c.us','🔔 3afak twasl m3 client dyal colis '+code+' f '+info.Ville+' daba! 📞');
          await send(from,'✅ Twaslna m3 '+info.Livreur+' bach ytwasl m3 client 📲');
          return;
        }

        if(!info||!code)return;
        const reply=buildReply(info,code);
        await send(from,reply);
      }catch(e){console.error('❌ '+e.message);}
    });
  }else{
    res.writeHead(200);res.end('Yanis Bot OK');
  }
}).listen(process.env.PORT||3000,()=>console.log('🚀 Yanis Bot OK'));
