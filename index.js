const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { exec } = require('child_process');
const readline = require('readline');

// הגדרת רשימה שחורה (מספרי טלפון בפורמט בינלאומי ללא פלוס)
const blacklist = ['972501234567', '972540000000'];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // מכבה QR כדי להשתמש ב-Pair Code
    auth: state,
  });

  // לוגיקת Pair Code
  if (!sock.authState.creds.registered) {
    const phoneNumber = await question('הכנס את מספר הטלפון של הבוט (לדוגמה 972501112222): ');
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`\nקוד החיבור שלך הוא: ${code}\n`);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('הבוט מחובר ומוכן לעבודה!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid.split('@')[0];
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    // בדיקה אם המשתמש ברשימה השחורה
    if (blacklist.includes(sender)) {
      console.log(`הודעה התקבלה מ-${sender} (חסום), מתעלם...`);
      return;
    }

    // זיהוי לינק של יוטיוב
    if (text && (text.includes('youtube.com/') || text.includes('youtu.be/'))) {
      const url = text.match(/\bhttps?:\/\/\S+/gi)[0];

      console.log(`מחלץ לינק עבור: ${url}`);

      // הרצת yt-dlp -g
      exec(`yt-dlp -g -f "bestaudio" "${url}"`, async (error, stdout, stderr) => {
        if (error) {
          await sock.sendMessage(msg.key.remoteJid, { text: 'שגיאה בחילוץ הלינק. וודא שהלינק תקין.' });
          return;
        }

        const directLink = stdout.trim();
        await sock.sendMessage(msg.key.remoteJid, {
          text: `${directLink}`,
        });
      });
    }
  });
}

startBot();
