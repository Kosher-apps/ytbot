const { execFile } = require('child_process');

function extractAudioDirectLink(url) {
  return new Promise((resolve, reject) => {
    execFile('yt-dlp', ['-g', '-f', 'bestaudio', url], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr?.trim() || error.message));
        return;
      }

      const directLink = stdout.trim();
      if (!directLink) {
        reject(new Error('yt-dlp returned an empty result'));
        return;
      }

      resolve(directLink);
    });
  });
}

module.exports = {
  extractAudioDirectLink,
};
