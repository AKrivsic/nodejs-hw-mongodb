import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';

import { FIFTEEN_MINUTES, THIRTY_DAYS, SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';

const createSessionPayload = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export async function registerUser(payload) {
  const existing = await UsersCollection.findOne({ email: payload.email });
  if (existing) throw createHttpError(409, 'Email in use');

  const hash = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create({ ...payload, password: hash });
}

export async function loginUser({ email, password }) {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(401, 'User not found');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw createHttpError(401, 'Unauthorized');

  await SessionsCollection.deleteOne({ userId: user._id });

  const sessionPayload = createSessionPayload();
  return await SessionsCollection.create({ userId: user._id, ...sessionPayload });
}

export async function refreshUsersSession({ sessionId, refreshToken }) {
  const session = await SessionsCollection.findOne({ _id: sessionId, refreshToken });
  if (!session) throw createHttpError(401, 'Session not found');

  const isExpired = Date.now() > new Date(session.refreshTokenValidUntil).getTime();
  if (isExpired) throw createHttpError(401, 'Session token expired');

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  const newPayload = createSessionPayload();
  return await SessionsCollection.create({ userId: session.userId, ...newPayload });
}

export async function logoutUser(sessionId) {
  await SessionsCollection.deleteOne({ _id: sessionId });
}

export async function requestResetToken(email) {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found');

  const resetToken = jwt.sign(
    { sub: user._id.toString(), email },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '15m' },
  );

  const resetPasswordTemplatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');
  const templateSource = (await fs.readFile(resetPasswordTemplatePath)).toString();
  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
}

export async function resetPassword(payload) {
  let decoded;
  try {
    decoded = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    throw createHttpError(401, err instanceof Error ? err.message : 'Invalid token');
  }

  const user = await UsersCollection.findOne({ _id: decoded.sub, email: decoded.email });
  if (!user) throw createHttpError(404, 'User not found');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  await UsersCollection.updateOne({ _id: user._id }, { password: encryptedPassword });

}
