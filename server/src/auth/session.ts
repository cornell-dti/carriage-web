import session from 'express-session';
import FileStore from 'session-file-store';
import path from 'path';

const FileStoreSession = FileStore(session);

// Session storage path
const sessionStorePath = process.env.SESSION_STORE_PATH || './private/sessions';

// Session TTL (24 hours default)
const sessionTTL = parseInt(process.env.SESSION_TTL || '86400000', 10);

// Session middleware configuration
export const sessionMiddleware = session({
  store: new FileStoreSession({
    path: path.resolve(sessionStorePath),
    ttl: sessionTTL / 1000, // Convert ms to seconds
    retries: 0,
    secret: process.env.SESSION_SECRET!,
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  name: 'carriage.sid', // Custom session cookie name
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    // In production the frontend (Netlify) and backend (Vercel) are on different sites,
    // so we must allow the session cookie to be sent on cross-site XHR/fetch requests.
    // SameSite=Lax works for localhost (same-site) but *blocks* these requests in prod.
    sameSite: 'none',
    maxAge: sessionTTL,
  },
});

// Type augmentation for Express Session
declare module 'express-session' {
  interface SessionData {
    user?: {
      netid: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    };
    authMethod?: 'sso' | 'google';
    redirectUri?: string;
    requestedUserType?: string;
    userType?: string;
    unregisteredUser?: {
      email: string;
      name: string;
    };
  }
}
