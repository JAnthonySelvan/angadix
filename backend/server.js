import { env } from './src/config/env.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import app from './src/app.js';

// Global Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  console.error('\x1b[31m[CRITICAL] Uncaught Exception:\x1b[0m', err.message);
  console.error(err.stack);
  process.exit(1);
});

let server;

// Connect to Database and Start Express Server
const startServer = async () => {
  await connectDB();

  server = app.listen(env.port, () => {
    console.log(
      `\x1b[32m===================================================\x1b[0m`
    );
    console.log(
      `\x1b[32m🚀 Angadix Backend running in [${env.nodeEnv.toUpperCase()}] mode\x1b[0m`
    );
    console.log(`\x1b[36m🌐 Server listening on http://localhost:${env.port}\x1b[0m`);
    console.log(
      `\x1b[32m===================================================\x1b[0m`
    );
  });
};

startServer();

// Global Unhandled Promise Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('\x1b[31m[CRITICAL] Unhandled Rejection at:\x1b[0m', promise);
  console.error('Reason:', reason);
  if (server) {
    server.close(() => {
      disconnectDB().then(() => process.exit(1));
    });
  } else {
    process.exit(1);
  }
});

// Graceful Termination Signal Handlers (SIGINT, SIGTERM)
const gracefulShutdown = (signal) => {
  console.log(`\n\x1b[33mReceived ${signal}. Initiating graceful shutdown...\x1b[0m`);
  if (server) {
    server.close(async () => {
      console.log('\x1b[32mHTTP server closed.\x1b[0m');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
