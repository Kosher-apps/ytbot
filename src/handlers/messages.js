const { getMessageText, getSender } = require('../utils/message');
const { containsYoutubeLink, extractFirstUrl } = require('../utils/url');
const { extractAudioDirectLink } = require('../services/ytdlp');

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
      await sock.sendMessage(msg.key.remoteJid, {
        text: 'זוהה לינק יוטיוב, אבל לא הצלחתי לחלץ URL תקין מההודעה.',
      });
      return;
    }

    console.log(`מחלץ לינק עבור: ${url}`);

    try {
      const directLink = await extractAudioDirectLink(url);
      await sock.sendMessage(msg.key.remoteJid, { text: directLink });
    } catch (error) {
      console.error('yt-dlp error:', error.message);
      await sock.sendMessage(msg.key.remoteJid, {
        text: 'שגיאה בחילוץ הלינק. וודא שהלינק תקין ו-yt-dlp מותקן בשרת.',
      });
    }
  });
}

module.exports = {
  registerMessageHandler,
};
