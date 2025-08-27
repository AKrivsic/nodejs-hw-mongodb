import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContactsController, getContactByIdController } from './controllers/contacts.controller.js';

export function setupServer() {
  const app = express();

  app.use(
    pino({
      transport: { target: 'pino-pretty' },
    }),
  );
  app.use(cors());
  app.use(express.json());

  app.get('/contacts', getAllContactsController);
  app.get('/contacts/:contactId', getContactByIdController);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  const PORT = Number(getEnvVar('PORT', '3000'));
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
