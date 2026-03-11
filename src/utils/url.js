const YOUTUBE_PATTERNS = ['youtube.com/', 'youtu.be/'];

function containsYoutubeLink(text) {
  if (!text) return false;
  return YOUTUBE_PATTERNS.some((pattern) => text.includes(pattern));
}

function extractFirstUrl(text) {
  if (!text) return null;
  const match = text.match(/\bhttps?:\/\/\S+/gi);
  return match?.[0] || null;
}

module.exports = {
  containsYoutubeLink,
  extractFirstUrl,
};
