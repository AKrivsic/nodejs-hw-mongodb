import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getEnvVar } from './utils/getEnvVar.js';
import contactsRouter from './routers/contacts.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function setupServer() {
  const app = express();

  app.use(
    pino({
      transport: { target: 'pino-pretty' },
    }),
  );
  app.use(cors());
  app.use(express.json());

  app.use(contactsRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  const PORT = Number(getEnvVar('PORT', '3000'));
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}