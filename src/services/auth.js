import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

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
  if (existing) {
    throw createHttpError(409, 'Email in use');
  }
  const hash = await bcrypt.hash(payload.password, 10);
  const user = await UsersCollection.create({
    ...payload,
    password: hash,
  });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'User not found');
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const sessionPayload = createSessionPayload();
  const session = await SessionsCollection.create({
    userId: user._id,
    ...sessionPayload,
  });

  return session;
}

export async function refreshUsersSession({ sessionId, refreshToken }) {
  const session = await SessionsCollection.findOne({ _id: sessionId, refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isExpired = Date.now() > new Date(session.refreshTokenValidUntil).getTime();
  if (isExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  const newPayload = createSessionPayload();
  const newSession = await SessionsCollection.create({
    userId: session.userId,
    ...newPayload,
  });

  return newSession;
}

export async function logoutUser(sessionId) {
  await SessionsCollection.deleteOne({ _id: sessionId });
}
