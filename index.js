const https = require('https');
const http = require('http');

const IID = '7107607381';
const ITOKEN = '06df99fcaf654e6dbd0d504cf1413b60144f1c48ac824ea2b5';
const GROQ = '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';
const GBASE = 'https://api.green-api.com';
const OWNER = '212716508833@c.us';
const KW = ['مزروب','عاجل','urgent','مشكل','مفقود','رقم الموزع','ضايع'];

const CITIES = `مكناس: كل يوم (نفس النهار)
الخميسات: كل يوم
تيفلت: كل يوم
أزرو: الاثنين والأربعاء والجمعة
إفران: الاثنين والأربعاء والجمعة
بوفكران: الثلاثاء والخميس والسبت
الحاجب: الثلاثاء والخميس والسبت
سيدي قاسم: كل يوم
سيدي سليمان: كل يوم
سبعيون: كل يوم ما عدا الجمعة
واد الجديدة: كل يوم ما عدا الجمعة
بودربالة: كل يوم ما عدا الجمعة
الحاج قدور: كل يوم ما عدا الجمعة
لمهاية: كل يوم ما عدا الجمعة
تاوجطات: كل يوم ما عدا الجمعة
أگوراي: الثلاثاء والجمعة
أيت يعزم: الثلاثاء والجمعة
مولاي إدريس: الأربعاء والسبت
سبت جحجوح: الخميس
عين جيري: الخميس`;

function httpsGet(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function httpsPost(url, body) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const buf = Buffer.from(body);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({}); }
      });
    });
    req.on('error', () => resolve({}));
    req.write(buf);
    req.end();
  });
}

function httpsPostAuth(url, body, token) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const buf = Buffer.from(body);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': buf.length
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({}); }
      });
    });
    req.on('error', () => resolve({}));
    req.write(buf);
    req.end();
  });
}

async function trackOrder(code) {
  const url = `https://yanisdelivery.site/track1.php?code=${encodeURIComponent(code)}`;
  console.log('🔍 تتبع طرد:', code);
  const data = await httpsGet(url);
  if (!data || !data[0]) return null;
  console.log('📦 نتيجة:', JSON.stringify(data[0]));
  return data[0];
}

function extractCode(text) {
  const match = text.match(/[A-Z]{2,5}-\d{2}-\d{2}-\d{4}-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function translateStatus(etat) {
  const map = {
    'Livré': '✅ وصل للعميل',
    'Annulé': '❌ ملغي',
    'En cours': '🚚 في الطريق',
    'Retour': '↩️ راجع',
    'En attente': '⏳ في الانتظار',
    'Reporté': '📅 مؤجل'
  };
  return map[etat] || etat;
}

async function generateReply(text, trackInfo) {
  let systemContent = `أنت بوت ذكي لشركة Yanis Delivery للتوصيل في المغرب.
مهمتك: الرد على أسئلة العملاء والموزعين بالدارجة المغربية أو الفرنسية حسب لغة السؤال.

جدول التوصيل حسب المنطقة:
${CITIES}

قواعد مهمة:
- إذا سأل عن طرد وعندك معلوماته: قدم المعلومات بشكل واضح
- إذا قال مزروب أو عاجل: أكد أنك أخبرت المسؤول
- إذا طلب رقم الموزع: أعطه الرقم إذا كان متوفر
- كن مختصراً (جملة أو جملتين) مع إيموجي مناسب
- لا تخترع معلومات`;

  if (trackInfo) {
    systemContent += `\n\nمعلومات الطرد المطلوب:
- الحالة: ${translateStatus(trackInfo.Etat)}
- المدينة: ${trackInfo.Ville}
- الموزع: ${trackInfo.Livreur}
- هاتف الموزع: ${trackInfo.Telephone}`;
  }

  const result = await httpsPostAuth(
    'https://api.groq.com/openai/v1/chat/completions',
    JSON.stringify({
      model: 'llama3-8b-8192',
      max_tokens: 200,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: text }
      ]
    }),
    GROQ
  );

  return result.choices?.[0]?.message?.content || null;
}

async function sendMessage(chatId, message) {
  console.log('📤 إرسال لـ:', chatId);
  await httpsPost(
    `${GBASE}/waInstance${IID}/sendMessage/${ITOKEN}`,
    JSON.stringify({ chatId, message })
  );
}

async function processMessage(body) {
  try {
    if (body.typeWebhook !== 'incomingMessageReceived') return;

    const text = body.messageData?.textMessageData?.textMessage || '';
    const chatId = body.senderData?.chatId || '';
    const senderName = body.senderData?.senderName || 'عميل';
    const isGroup = chatId.includes('@g.us');

    if (!text || !isGroup) {
      console.log('⏭️ تجاهل - مش مجموعة أو ما فيهش نص');
      return;
    }

    console.log(`📨 رسالة من ${senderName}: ${text}`);

    // تنبيه كلمات عاجلة
    if (KW.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
      console.log('🚨 كلمة عاجلة!');
      await sendMessage(OWNER, `🚨 تنبيه!\nمن: ${senderName}\nفي المجموعة\nرسالة: ${text}`);
    }

    // بحث عن رقم طرد
    const code = extractCode(text);
    let trackInfo = null;
    if (code) {
      trackInfo = await trackOrder(code);
    }

    // توليد الرد
    const reply = await generateReply(text, trackInfo);
    if (reply) {
      await sendMessage(chatId, reply);
      console.log('✅ رد أرسل:', reply.substring(0, 50));
    }

  } catch (e) {
    console.error('❌ خطأ:', e.message);
  }
}

// HTTP Server - يستقبل Webhooks
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      res.writeHead(200);
      res.end('OK');
      try {
        const data = JSON.parse(body);
        console.log('📡 Webhook وصل:', data.typeWebhook || 'unknown');
        await processMessage(data);
      } catch (e) {
        console.error('❌ خطأ في الـ webhook:', e.message);
      }
    });
  } else {
    res.writeHead(200);
    res.end('🚀 Yanis Delivery Bot - Running!');
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🚀 البوت شغال وكيستنى الـ webhooks!');
  console.log('📡 Webhook URL: https://yanis-bot-production.up.railway.app/webhook');
});    const txt=d.body.messageData?.textMessageData?.textMessage||'';
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
