const https=require('https');const http=require('http');
const UINSTANCE='instance176233';
const UTOKEN='cnurnc1zb5wduoa7';
const GROQ=process.env.GROQ_API_KEY;
const OWNER='212716508833';
const MANAGER='212709009564';
const SIDA='212780556236';

const LIVREURS=[
  '212669995519','212664103198','212617380508','212693439316',
  '212659188309','212620815218','212613029454','212622335750','212659313678'
];
const ETAT_LIVREURS=['212664103198','212613029454','212669995519'];

const SCHEDULE={
  'مكناس':'كل يوم (نفس النهار)','meknes':'كل يوم (نفس النهار)',
  'الخميسات':'كل يوم','khmisat':'كل يوم',
  'تيفلت':'كل يوم','tiflet':'كل يوم',
  'أزرو':'الاثنين والأربعاء والجمعة','azrou':'الاثنين والأربعاء والجمعة',
  'إفران':'الاثنين والأربعاء والجمعة','ifrane':'الاثنين والأربعاء والجمعة',
  'بوفكران':'الثلاثاء والخميس والسبت','boufkrane':'الثلاثاء والخميس والسبت',
  'الحاجب':'الثلاثاء والخميس والسبت','hajeb':'الثلاثاء والخميس والسبت',
  'سيدي قاسم':'كل يوم','sidi kacem':'كل يوم',
  'سيدي سليمان':'كل يوم','sidi slimane':'كل يوم',
  'سبعيون':'كل يوم ما عدا الجمعة','sebaa ayoun':'كل يوم ما عدا الجمعة',
  'واد الجديدة':'كل يوم ما عدا الجمعة','oued jdida':'كل يوم ما عدا الجمعة',
  'بودربالة':'كل يوم ما عدا الجمعة','bouderbala':'كل يوم ما عدا الجمعة',
  'أگوراي':'الثلاثاء والجمعة','agourai':'الثلاثاء والجمعة',
  'أيت يعزم':'الثلاثاء والجمعة','ait yaazem':'الثلاثاء والجمعة',
  'مولاي إدريس':'الأربعاء والسبت','moulay idriss':'الأربعاء والسبت',
  'سبت جحجوح':'الخميس','sebt jahjouh':'الخميس',
  'عين جيري':'الخميس','ain jiri':'الخميس',
};

const ST={
  'Livré':'wslat ✅','Annulé':'mlghiya ❌',
  'En cours':'f triq 🚚','Retour':'raja3at ↩️',
  'En attente':'kattsna ⏳','Reporté':'m2ajala 📅',
  'Reporte':'m2ajala 📅','Sorti':'khrajat 🚴'
};

const CONTACT_KW=['soni client','soni l client','صوني لكليان','سوني لكليان','تواصلو مع الكليان','twaslo m3a client','twasl m3a client','appel client','يعاود يصوني'];
const MANAGER_KW=['etat','screen appel','jawbona','جاوبونا'];
const SCHEDULE_KW=['fo9ach twsal','فوقاش توصل','متى توصل','fo9ash twsal'];
const URGENT_KW=['مزروب','عاجل','urgent','مشكل','مفقود','ضايع'];

function get(url){return new Promise(r=>{https.get(url,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r(null)}})}).on('error',()=>r(null))});}
function post(url,body,auth){return new Promise(r=>{const u=new URL(url);const b=Buffer.from(JSON.stringify(body));const h={'Content-Type':'application/json','Content-Length':b.length};if(auth)h['Authorization']='Bearer '+auth;const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:h},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{r(JSON.parse(d))}catch{r({})}})});req.on('error',()=>r({}));req.write(b);req.end()});}

async function send(to,msg){
  const phone=to.includes('@')?to:to+'@c.us';
  return new Promise(r=>{
    const u=new URL('https://api.ultramsg.com/'+UINSTANCE+'/messages/chat');
    const b=Buffer.from('token='+UTOKEN+'&to='+encodeURIComponent(phone)+'&body='+encodeURIComponent(msg)+'&priority=10');
    const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':b.length}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{console.log('📤 '+d.substring(0,60));r(d)})});
    req.on('error',e=>{console.error('send err:'+e.message);r(null)});
    req.write(b);req.end();
  });
}

async function track(code){const d=await get('https://yanisdelivery.site/track1.php?code='+code);return d&&d[0]?d[0]:null;}

function findCode(t){
  const patterns=[/[A-Z]{2,6}\d{6,12}[A-Z]{0,4}/i,/[A-Z]{2,5}-\d{2}-\d{2}-\d{4}-\d+/i,/[A-Z]{2,5}-\d{8,}-\d+/i,/\b\d{4,10}\b/];
  for(const p of patterns){const m=t.match(p);if(m)return m[0].toUpperCase();}
  return null;
}

function findCity(t){
  const lower=t.toLowerCase();
  for(const city of Object.keys(SCHEDULE)){if(lower.includes(city.toLowerCase()))return city;}
  return null;
}

function formatPhone(tel){return '212'+tel.replace(/^(\+212|0)/,'');}

const pendingMedia={};

async function aiReply(txt,context){
  const sys=`أنت بوت Yanis Delivery المغربي. ${context||''} 
جاوب بطبيعية بالدارجة المغربية مخلوطة مع شوية فرنسية بحال ما كيهضرو الناس. جملة أو جملتين فقط مع إيموجي. كن لطيف ومحترم.`;
  const r=await post('https://api.groq.com/openai/v1/chat/completions',{model:'llama-3.3-70b-versatile',max_tokens:120,messages:[{role:'system',content:sys},{role:'user',content:txt}]},GROQ);
  return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:null;
}

function scheduleDaily(hour,min,callback){
  function run(){
    const now=new Date();
    const target=new Date();
    target.setHours(hour,min,0,0);
    if(now>=target)target.setDate(target.getDate()+1);
    setTimeout(async()=>{await callback();run();},target-now);
  }
  run();
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
        const msgType=data.type||'text';
        const isGroup=from.includes('@g.us')||data.isGroup===true;
        const sender=data.author||data.from||'';
        const msgId=data.id||Date.now().toString();

        // رسائل خاصة
        if(!isGroup){
          const senderNum=sender.replace('@c.us','').replace('+','');
          const isKnown=[SIDA,MANAGER,...LIVREURS].includes(senderNum);
          if(isKnown&&txt){
            const isSida=senderNum===SIDA;
            const context=isSida?'الشخص اللي كيكلمك هي المسؤولة عن إدخال البيانات، جاوبها بلطافة واحترام.':'الشخص اللي كيكلمك هو موزع، جاوبه بلطافة.';
            const reply=await aiReply(txt,context);
            if(reply)await send(sender,reply);
          }
          return;
        }

        console.log('📨 ['+msgType+'] '+txt.substring(0,60));

        // صورة أو صوت
        if(msgType==='image'||msgType==='audio'||msgType==='ptt'||msgType==='video'){
          pendingMedia[msgId]={from,sender,time:Date.now()};
          setTimeout(async()=>{
            if(pendingMedia[msgId]){
              delete pendingMedia[msgId];
              await send(MANAGER,'⚠️ رسالة '+msgType+' من '+sender+' بدون جواب +10 دقائق!');
            }
          },10*60*1000);
          return;
        }

        if(data.quotedMsg&&pendingMedia[data.quotedMsg.id]){
          delete pendingMedia[data.quotedMsg.id];
        }

        if(!txt)return;
        const lower=txt.toLowerCase();

        // عاجل
        if(URGENT_KW.some(k=>lower.includes(k.toLowerCase()))){
          await send(MANAGER,'🚨 تنبيه عاجل!\nمن: '+sender+'\nرسالة: '+txt);
        }

        // تنبيه المسؤولة
        if(MANAGER_KW.some(k=>lower.includes(k.toLowerCase()))){
          await send(MANAGER,'📢 تنبيه!\nمن: '+sender+'\nرسالة: '+txt);
        }

        const code=findCode(txt);
        const info=code?await track(code):null;

        // تواصل مع العميل
        if(CONTACT_KW.some(k=>lower.includes(k.toLowerCase()))){
          if(info&&info.Telephone){
            const livreurPhone=formatPhone(info.Telephone);
            await send(livreurPhone,'🔔 3afak twasl m3 client dyal colis '+(code||'')+' f '+info.Ville+' daba! 📞');
            await send(from,'✅ Twaslna m3 '+info.Livreur+' bach ytwasl m3 client 📲');
          } else {
            await send(from,'⚠️ 3tini raqm colis bach n3ref chkun llivreur 📦');
          }
          return;
        }

        // جدول التوصيل
        if(SCHEDULE_KW.some(k=>lower.includes(k.toLowerCase()))){
          const city=findCity(txt)||info?.Ville;
          if(city){
            const days=SCHEDULE[city.toLowerCase()]||SCHEDULE[city]||'غير محددة';
            await send(from,'📅 Livraison f '+city+': '+days+' 🚚');
            if(info&&info.Telephone){
              await send(formatPhone(info.Telephone),'📅 Client swal 3la maw3id livraison f '+city+(code?' — colis '+code:''));
            }
          } else {
            await send(from,'3tini raqm colis aw smiya lmedina bach n3tik lmaw3id 📦');
          }
          return;
        }

        // رقم طرد
        if(info&&code){
          const etat=ST[info.Etat]||info.Etat;
          await send(from,'Colis dyalk '+code+' '+etat+'\n3and: '+info.Livreur+' f '+info.Ville+'\nTél: '+info.Telephone+' 📞');
          return;
        }

        // جواب عادي على أي رسالة
        const context=info?'معلومات الطرد: حالة='+(ST[info.Etat]||info.Etat)+' مدينة='+info.Ville+' موزع='+info.Livreur+' هاتف='+info.Telephone:'';
        const reply=await aiReply(txt,context);
        if(reply)await send(from,reply);

      }catch(e){console.error('❌ '+e.message);}
    });
  }else{
    res.writeHead(200);res.end('Yanis Bot OK');
  }
}).listen(process.env.PORT||3000,()=>{
  console.log('🚀 Yanis Bot OK');
  scheduleDaily(12,0,async()=>{
    await send(SIDA,'🌞 صباح الخير! وقت إدخال bon excel 📊');
    for(const num of ETAT_LIVREURS){await send(num,'🌞 صباح الخير! 3afak kamlo etat 📦');await new Promise(r=>setTimeout(r,1000));}
  });
  scheduleDaily(21,0,async()=>{
    for(const num of LIVREURS){await send(num,'🌙 3afak kamlo etat dyal les colis — Barak Allahu fikum 📦');await new Promise(r=>setTimeout(r,1000));}
  });
  scheduleDaily(22,0,async()=>{await send(SIDA,'🌙 وقت إدخال etat ديال الطرود 📊');});
  scheduleDaily(23,30,async()=>{await send(SIDA,'🌙 وقت إدخال bon excel الليلي 📊');});
});
