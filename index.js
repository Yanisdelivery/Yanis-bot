const https=require('https');const http=require('http');
const UINSTANCE='instance176233';
const UTOKEN='cnurnc1zb5wduoa7';
const GROQ=process.env.GROQ_API_KEY;
const OWNER='212716508833';
const MANAGER='212709009564'; // المسؤولة
const SIDA='212780556236';    // إيمان / السيدة

const LIVREURS=[
  '212669995519','212664103198','212617380508','212693439316',
  '212659188309','212620815218','212613029454','212622335750','212659313678'
];
const ETAT_LIVREURS=['212664103198','212613029454','212669995519'];
const SCREEN_LIVREURS=['212613029454','212664103198','212669995519']; // gharbal, zouaki, salim

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
const URGENT_KW=['مزروب','عاجل','urgent','مشكل','مفقود','ضايع'];
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
  const url='https://yanisdelivery.site/track1.php?code='+encodeURIComponent(code);
  const d=await get(url);
  return d&&d[0]?d[0]:null;
}

function findCode(t){
  const patterns=[
    /[A-Z]{2,6}-\d{2}-\d{2}-\d{4}-\d+/i,          // NEX-22-05-2026-05967512
    /[A-Z]{2,6}-\d{8,14}-\d+/i,                     // BDR-20052026-4919396, SKY-23052026050648-112790, YNS-23052026-67397, Ema-18052026-04586
    /[A-Z]{2,6}-\d{3,6}/i,                           // Led-577
    /[A-Z]{2,6}\d{2,6}[A-Z]{1,4}\d{2,8}/i,          // COD1049MA8307, HJB052687249HT
    /[A-Z]{2,6}\d{6,12}[A-Z]{0,4}/i,                // MKNS0526922497DB
    /\b\d{4,10}\b/                                    // 99035
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

function isPositive(t){
  return ['oui','ايه','ah','ayh','ewa','اه','نعم','yes'].some(k=>t.toLowerCase().trim()===k||t.toLowerCase().includes(k));
}

// حالة المحادثات
const conversations={};
const pendingMedia={};
const pendingNotif={};

function scheduleDaily(hour,min,callback){
  function run(){
    const now=new Date();
    const target=new Date();
    target.setHours(hour,min,0,0);
    if(now>=target)target.setDate(target.getDate()+1);
    setTimeout(async()=>{
      const day=new Date().getDay();
      if(day!==0){await callback();}
      run();
    },target-now);
  }
  run();
}

async function notifyLivreur(phone,msg,from,notifKey){
  await send(phone,msg);
  // إعادة التنبيه بعد 15 دقيقة إذا ما جاوبش
  if(notifKey){
    pendingNotif[notifKey]={phone,msg,time:Date.now()};
    setTimeout(async()=>{
      if(pendingNotif[notifKey]){
        delete pendingNotif[notifKey];
        await send(phone,'🔔 تذكير: '+msg);
        await send(MANAGER,'⚠️ الموزع ما شافش الرسالة: '+phone);
      }
    },15*60*1000);
  }
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
          // إذا الموزع رد — امسح تنبيه إعادة التذكير
          Object.keys(pendingNotif).forEach(k=>{
            if(pendingNotif[k]&&pendingNotif[k].phone===senderNum){
              delete pendingNotif[k];
              console.log('✅ موزع رد — إلغاء التذكير');
            }
          });
          return;
        }

        console.log('📨 ['+msgType+'] '+txt.substring(0,60));

        // صورة أو فيديو — يطلب الكود
        if(msgType==='image'||msgType==='video'){
          if(!pendingMedia[from])pendingMedia[from]={count:0};
          pendingMedia[from].count++;
          await send(from,'ممكن تكتب code dyal colis bach nchoflk 📦');
          if(pendingMedia[from].count>=5){
            const groupName=data.chatName||data.groupName||from;
            await send(SIDA,'⚠️ زينب شوفي '+groupName+' — كاين +5 رسائل بدون رد 📸');
            pendingMedia[from].count=0;
          }
          return;
        }

        // صوت
        if(msgType==='audio'||msgType==='ptt'){
          if(!pendingMedia[from])pendingMedia[from]={count:0};
          pendingMedia[from].count++;
          await send(from,'ممكن تكتب code dyal colis bach nchoflk 📦');
          if(pendingMedia[from].count>=5){
            const groupName=data.chatName||data.groupName||from;
            await send(SIDA,'⚠️ زينب شوفي '+groupName+' — كاين +5 رسائل بدون رد 🎤');
            pendingMedia[from].count=0;
          }
          return;
        }

        if(!txt)return;
        const lower=txt.toLowerCase();

        // إذا رد على محادثة سابقة
        if(conversations[from]){
          const conv=conversations[from];
          // إذا البوت سال واش يبعت للموزع أو زينب
          if(conv.waitingForConfirm){
            if(isPositive(txt)){
              const info=conv.info;
              const code=conv.code;
              if(info&&info.Telephone){
                const livreurPhone=formatPhone(info.Telephone);
                const notifKey=livreurPhone+'-'+Date.now();
                if(conv.type==='screen'){
                  await notifyLivreur(livreurPhone,'📸 3tina screen dyal appel colis '+code+' 3afak!',from,notifKey);
                  await send(SIDA,'📸 طلب screen للموزع '+info.Livreur+' — colis '+code);
                }else{
                  await notifyLivreur(livreurPhone,'🔔 3afak twasl m3 client dyal colis '+code+' f '+info.Ville+'!',from,notifKey);
                }
                await send(from,'✅ Twaslna m3 '+info.Livreur+' 📲');
              }
            } else {
              await send(from,'Wakha, ila htajti ay haja 3tina code dyal colis 📦');
            }
            delete conversations[from];
            return;
          }
          delete conversations[from];
        }

        // تحيات
        const hour=new Date().getHours();
        const isMorning=hour>=5&&hour<12;
        const isEvening=hour>=18;
        if(lower==='salam'||lower==='السلام'||lower==='salam 3likom'||lower==='السلام عليكم'){
          await send(from,isMorning?'وعليكم السلام! صباح النور 🌞':isEvening?'وعليكم السلام! مساء النور 🌙':'وعليكم السلام! 😊');
          return;
        }
        if(lower==='bonjour'||lower==='bonjour!'){await send(from,'Bonjour merhba! 🌞');return;}
        if(lower==='bonsoir'||lower==='bonsoir!'){await send(from,'Bonsoir merhba! 🌙');return;}

        // كلمات تبعت لزينب
        const ZINEB_KW=['مزروب','mazroba','عاجل','urgent','جاوبونا','jawbona','عافاكم','3afakom'];
        if(ZINEB_KW.some(k=>lower.includes(k.toLowerCase()))){
          await send(SIDA,'⚠️ تنبيه!\nمن: '+sender+'\nرسالة: '+txt);
        }

        const code=findCode(txt);
        const info=code?await track(code):null;

        // screen appel
        if(SCREEN_KW.some(k=>lower.includes(k.toLowerCase()))){
          // يقول للعميل يبعت السكرين لأنس
          await send(from,'📸 Screen dyal appel wsifto m3ak l Zineb wala Anas — 0777990976 😊');
          // في الخلفية يبعت لزينب تنبيه
          const notifKey='screen-'+from+'-'+Date.now();
          await send(SIDA,'📸 طلب screen'+(code?' — colis '+code:'')+' في المجموعة');
          // إذا زينب ما جاوبتش 15 دقيقة → يبعت لأنس
          pendingNotif[notifKey]={phone:SIDA,time:Date.now()};
          setTimeout(async()=>{
            if(pendingNotif[notifKey]){
              delete pendingNotif[notifKey];
              await send(OWNER,'⚠️ زينب ما جاوبتش على طلب screen'+(code?' — colis '+code:''));
            }
          },15*60*1000);
          return;
        }

        // تواصل مع العميل
        if(CONTACT_KW.some(k=>lower.includes(k.toLowerCase()))){
          if(info&&info.Telephone){
            const livreurPhone=formatPhone(info.Telephone);
            const notifKey=livreurPhone+'-contact-'+Date.now();
            await notifyLivreur(livreurPhone,'🔔 3afak twasl m3 client dyal colis '+code+' f '+info.Ville+'!',from,notifKey);
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
          const reply=etat+'\n3and: '+info.Livreur+' f '+info.Ville+'\nTél: '+info.Telephone+' 📞';
          await send(from,reply);

          // إذا "Reçu par livreur" + 22h → بعت للثلاثة + إيمان
          const currentHour=new Date().getHours();
          if((info.Etat==='Reçu par livreur'||info.Etat==='Recu par livreur')&&currentHour>=22){
            const livreurPhone=formatPhone(info.Telephone);
            if(SCREEN_LIVREURS.includes(livreurPhone)){
              const msg='⚠️ Colis '+code+' mazal "Reçu par livreur" f '+info.Ville+' — 3afak update etat!';
              for(const num of SCREEN_LIVREURS){await send(num,msg);await new Promise(r=>setTimeout(r,500));}
              await send(SIDA,'⚠️ تنبيه: colis '+code+' مازال "Reçu par livreur" — '+info.Livreur);
            }
          }

          // إذا الجواب ما كافيش — سول
          conversations[from]={info,code,waitingForConfirm:true,type:'contact'};
          setTimeout(()=>{if(conversations[from])delete conversations[from];},5*60*1000);
          await send(from,'Kafia lmaeluma? Ila bghiti nchoflk akter 3tini code dyal colis 📦');
          return;
        }

        // ما فهمش
        await send(from,'Ana nchof m3a Zineb dkhol tjawb 😊');

      }catch(e){console.error('❌ '+e.message);}
    });
  }else{
    res.writeHead(200);res.end('Yanis Bot OK');
  }
}).listen(process.env.PORT||3000,()=>{
  console.log('🚀 Yanis Bot OK');

  // 12h — بدون الأحد
  scheduleDaily(12,0,async()=>{
    await send(SIDA,'🌞 صباح الخير! وقت إدخال bon excel 📊');
    for(const num of ETAT_LIVREURS){await send(num,'🌞 صباح الخير! 3afak kamlo etat 📦');await new Promise(r=>setTimeout(r,1000));}
  });

  // 21h — بدون الأحد
  scheduleDaily(21,0,async()=>{
    for(const num of LIVREURS){await send(num,'🌙 3afak kamlo etat dyal les colis — Barak Allahu fikum 📦');await new Promise(r=>setTimeout(r,1000));}
  });

  // 22h — بدون الأحد
  scheduleDaily(22,0,async()=>{await send(SIDA,'🌙 وقت إدخال etat ديال الطرود 📊');});

  // 23h30 — بدون الأحد
  scheduleDaily(23,30,async()=>{await send(SIDA,'🌙 وقت إدخال bon excel الليلي 📊');});
});
 
