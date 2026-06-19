const https=require('https');const http=require('http');
const UINSTANCE='instance176233';
const UTOKEN='cnurnc1zb5wduoa7';
const GROQ=process.env.GROQ_API_KEY;
const OWNER='212716508833';
const ZINEB='212709009564';   // زينب
const SIDA='212780556236';    // إيمان/السيدة

const LIVREURS=['212669995519','212664103198','212617380508','212620815218','212613029454','212622335750','212659313678','212615884130','212694283619'];
const ETAT_LIVREURS=['212664103198','212613029454','212669995519','212615884130','212694283619'];
const SCREEN_LIVREURS=['212613029454','212664103198','212669995519'];

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
  'Livré':'Colis livré ✅',
  'Annulé':'Colis annulé ❌',
  'En cours':'Colis f triq 🚚',
  'Retour':'Colis raja3 ↩️',
  'En attente':'Colis kattsna ⏳',
  'Reporté':'Colis reporté 📅',
  'Reporte':'Colis reporté 📅',
  'Refusé':'Colis refusé 🚫',
  'Refuse':'Colis refusé 🚫',
  'Programmé':'Colis programmé 📆',
  'Programme':'Colis programmé 📆',
  'Hors zone':'Colis hors zone ⛔',
  'Sorti':'Colis khraj 🚴',
  'Reçu par livreur':'Reçu par livreur 📬',
  'Recu par livreur':'Reçu par livreur 📬'
};

const CONTACT_KW=['soni client','soni l client','صوني لكليان','سوني لكليان','تواصلو مع الكليان','twaslo m3a client','twasl m3a client','appel client','يعاود يصوني'];
const SCHEDULE_KW=['fo9ach twsal','فوقاش توصل','متى توصل','fo9ash twsal'];
const ZINEB_KW=['مزروب','mazroba','عاجل','urgent','جاوبونا','jawbona','عافاكم','3afakom'];
const SCREEN_KW=['screen','screen appel','سكرين'];

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

async function track(code){
  const d=await get('https://yanisdelivery.site/track1.php?code='+encodeURIComponent(code));
  return d&&d[0]?d[0]:null;
}

function findCode(t){
  const patterns=[
    /[A-Z]{2,6}-\d{2}-\d{2}-\d{4}-\d+/i,
    /[A-Z]{2,6}-\d{8,14}-\d+/i,
    /[A-Z]{2,6}-\d{3,6}/i,
    /[A-Z]{2,6}\d{2,6}[A-Z]{1,4}\d{2,8}/i,
    /[A-Z]{2,6}\d{6,12}[A-Z]{0,4}/i,
    /\b\d{4,10}\b/
  ];
  for(const p of patterns){const m=t.match(p);if(m)return m[0].toUpperCase();}
  return null;
}

function findCity(t){
  const lower=t.toLowerCase();
  for(const city of Object.keys(SCHEDULE)){if(lower.includes(city.toLowerCase()))return city;}
  return null;
}

function formatPhone(tel){return '212'+tel.replace(/^(\+212|0)/,'');}

async function notifyWithRetry(phone,msg,retryTo){
  await send(phone,msg);
  const key=phone+'-'+Date.now();
  setTimeout(async()=>{
    await send(phone,'🔔 تذكير: '+msg);
    if(retryTo)await send(retryTo,'⚠️ الموزع ما شافش الرسالة: '+phone);
  },15*60*1000);
}

async function aiReply(txt){
  const sys='أنت بوت Yanis Delivery المغربي. إذا ما عرفتش تجاوب قل بلطافة أن زينب غتجاوب. جاوب بالدارجة المغربية مخلوطة مع فرنسية بشكل طبيعي. جملة أو جملتين فقط متنوعين حسب السؤال.';
  const r=await post('https://api.groq.com/openai/v1/chat/completions',{model:'llama-3.3-70b-versatile',max_tokens:100,messages:[{role:'system',content:sys},{role:'user',content:txt}]},GROQ);
  return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:null;
}

const pendingMedia={};

function scheduleDaily(hour,min,callback){
  function run(){
    const now=new Date();
    const target=new Date();
    target.setHours(hour,min,0,0);
    if(now>=target)target.setDate(target.getDate()+1);
    setTimeout(async()=>{
      if(new Date().getDay()!==0)await callback();
      run();
    },target-now);
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
        if(!isGroup)return;

        console.log('📨 ['+msgType+'] '+txt.substring(0,60));

        // صورة/فيديو/صوت — عد فقط بدون رسالة
        if(msgType==='image'||msgType==='video'||msgType==='audio'||msgType==='ptt'){
          if(!pendingMedia[from])pendingMedia[from]={count:0};
          pendingMedia[from].count++;
          if(pendingMedia[from].count>=5){
            const groupName=data.chatName||data.groupName||from;
            await send(ZINEB,'⚠️ زينب شوفي '+groupName+' — كاين +5 رسائل بدون رد 📸');
            pendingMedia[from].count=0;
          }
          return;
        }

        if(!txt)return;
        const lower=txt.toLowerCase();

        // إذا جاوب أحد — صفر العداد
        if(data.quotedMsg)pendingMedia[from]={count:0};

        // تحيات
        const hour=new Date().getHours();
        const isMorning=hour>=5&&hour<12;
        const isEvening=hour>=18;
        if(lower==='salam'||lower==='السلام'||lower==='salam 3likom'||lower==='السلام عليكم'){
          await send(from,isMorning?'وعليكم السلام! صباح النور 🌞':isEvening?'وعليكم السلام! مساء النور 🌙':'وعليكم السلام! 😊');return;
        }
        if(lower==='bonjour'||lower==='bonjour!'){await send(from,'Bonjour merhba! 🌞');return;}
        if(lower==='bonsoir'||lower==='bonsoir!'){await send(from,'Bonsoir merhba! 🌙');return;}

        // تنبيه زينب
        if(ZINEB_KW.some(k=>lower.includes(k.toLowerCase()))){
          await send(ZINEB,'⚠️ تنبيه!\nمن: '+sender+'\nرسالة: '+txt);
        }

        const code=findCode(txt);
        const info=code?await track(code):null;

        // screen appel
        if(SCREEN_KW.some(k=>lower.includes(k.toLowerCase()))){
          await send(from,'📸 Screen dyal appel wsifto m3ak l Zineb wala Anas — 0777990976 😊');
          await send(ZINEB,'📸 طلب screen'+(code?' — colis '+code:'')+' في المجموعة');
          setTimeout(async()=>{await send(OWNER,'⚠️ زينب ما جاوبتش على طلب screen'+(code?' — colis '+code:''));},15*60*1000);
          return;
        }

        // تواصل مع العميل
        if(CONTACT_KW.some(k=>lower.includes(k.toLowerCase()))){
          if(info&&info.Telephone){
            await notifyWithRetry(formatPhone(info.Telephone),'🔔 3afak twasl m3 client dyal colis '+(code||'')+' f '+info.Ville+'!',OWNER);
            await send(from,'✅ Twaslna m3 '+info.Livreur+' 📲');
          } else {
            await send(from,'3tini code dyal colis bach nchoflk 📦');
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
            await send(from,'3tini code dyal colis aw smiya lmedina 📦');
          }
          return;
        }

        // رقم طرد
        if(info&&code){
          const etat=ST[info.Etat]||info.Etat;
          await send(from,etat+'\n3and: '+info.Livreur+' f '+info.Ville+'\nTél: '+info.Telephone+' 📞');
          // إعلام الموزع
          await send(formatPhone(info.Telephone),'📬 Client swal 3la colis '+code+' f '+info.Ville);
          // Reçu par livreur + 22h
          const currentHour=new Date().getHours();
          if((info.Etat==='Reçu par livreur'||info.Etat==='Recu par livreur')&&currentHour>=22){
            for(const num of SCREEN_LIVREURS){await send(num,'⚠️ Colis '+code+' mazal "Reçu par livreur" — 3afak update etat!');await new Promise(r=>setTimeout(r,500));}
            await send(SIDA,'⚠️ colis '+code+' مازال "Reçu par livreur" — '+info.Livreur);
          }
          return;
        }

        // ما فهمش — AI يجاوب
        const reply=await aiReply(txt);
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
    for(const num of ETAT_LIVREURS){await send(num,'🌞 صباح الخير! 3afak aji t3ti lhsab l Zineb 😊');await new Promise(r=>setTimeout(r,1000));}
  });
  scheduleDaily(21,0,async()=>{
    for(const num of LIVREURS){await send(num,'🌙 3afak kamlo etat dyal les colis — Barak Allahu fikum 📦');await new Promise(r=>setTimeout(r,1000));}
  });
  scheduleDaily(22,0,async()=>{await send(SIDA,'🌙 وقت إدخال etat ديال الطرود 📊');});
  scheduleDaily(23,30,async()=>{await send(SIDA,'🌙 وقت إدخال bon excel الليلي 📊');});
});
