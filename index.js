const { config } = require('./src/config');
const { startBot } = require('./src/bot');

startBot(config).catch((error) => {
  console.error('שגיאה קריטית בהפעלת הבוט:', error.message);
  process.exitCode = 1;
});
