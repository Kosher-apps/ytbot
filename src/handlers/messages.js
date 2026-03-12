const { getMessageText, getSender } = require('../utils/message');
const { containsYoutubeLink, extractFirstUrl } = require('../utils/url');
const { extractAudioDirectLink } = require('../services/ytdlp');

async function sendText(sock, jid, text) {
  // Disable auto link-preview generation to avoid optional dependency issues
  // (e.g. missing link-preview-js in some environments like Termux)
  await sock.sendMessage(jid, {
    text,
    linkPreview: null,
  });
}

function registerMessageHandler(sock, config) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg?.message || msg?.key?.fromMe) return;

    const sender = getSender(msg);
    const text = getMessageText(msg);

    if (sender && config.blacklist.includes(sender)) {
      console.log(`הודעה התקבלה מ-${sender} (חסום), מתעלם...`);
      return;
    }

    if (!containsYoutubeLink(text)) return;

    const url = extractFirstUrl(text);
    if (!url) {
      await sendText(sock, msg.key.remoteJid, 'זוהה לינק יוטיוב, אבל לא הצלחתי לחלץ URL תקין מההודעה.');
      return;
    }

    console.log(`מחלץ לינק עבור: ${url}`);

    try {
      const directLink = await extractAudioDirectLink(url);
      await sendText(sock, msg.key.remoteJid, directLink);
    } catch (error) {
      console.error('yt-dlp error:', error.message);
      await sendText(
        sock,
        msg.key.remoteJid,
        'שגיאה בחילוץ הלינק. וודא שהלינק תקין ו-yt-dlp מותקן בשרת.'
      );
    }
  });
}

module.exports = {
  registerMessageHandler,
};
