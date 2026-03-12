const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const { registerMessageHandler } = require('./handlers/messages');

function createPrompt() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (text) => new Promise((resolve) => rl.question(text, resolve));

  return {
    question,
    close: () => rl.close(),
  };
}

async function initializePairingCode(sock) {
  if (sock.authState.creds.registered) return;

  const prompt = createPrompt();
  const phoneNumber = await prompt.question('הכנס את מספר הטלפון של הבוט (לדוגמה 972501112222): ');
  prompt.close();

  const code = await sock.requestPairingCode(phoneNumber);
  console.log(`\nקוד החיבור שלך הוא: ${code}\n`);
}

async function startBot(config) {
  const { state, saveCreds } = await useMultiFileAuthState(config.authFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: config.loggerLevel }),
    printQRInTerminal: false,
    auth: state,
  });

  await initializePairingCode(sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log('החיבור נותק, מנסה להתחבר מחדש...');
        startBot(config).catch((error) => {
          console.error('שגיאה בהתחברות מחדש:', error.message);
        });
      }
      return;
    }

    if (connection === 'open') {
      console.log('הבוט מחובר ומוכן לעבודה!');
    }
  });

  registerMessageHandler(sock, config);
}

module.exports = {
  startBot,
};
