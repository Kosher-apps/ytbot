function getMessageText(msg) {
  return msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || '';
}

function getSender(msg) {
  return msg?.key?.remoteJid?.split('@')?.[0] || null;
}

module.exports = {
  getMessageText,
  getSender,
};
