import express, { Request, Response, NextFunction } from 'express';
import passport from '../auth/passport-sso';
import { findUserByNetID } from '../auth/sso-helpers';
import { sign } from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * GET /api/sso/login
 * Initiates SAML authentication flow
 */
router.get('/login', (req: Request, res: Response, next: NextFunction) => {
  const redirectUri = (req.query.redirect_uri as string) || '/';

  // Store redirect URI in session for post-login redirect
  req.session.redirectUri = redirectUri;

  passport.authenticate('saml', {
    failureRedirect: '/login?error=sso_failed',
  })(req, res, next);
});

/**
 * POST /api/sso/callback
 * SAML assertion consumer endpoint (receives SAML response from IdP)
 */
router.post(
  '/callback',
  passport.authenticate('saml', { failureRedirect: '/login?error=sso_failed' }),
  async (req: Request, res: Response) => {
    try {
      const samlUser = req.user as any;
      const netid = samlUser.netid;

      // Lookup user in database
      const result = await findUserByNetID(netid);

      // Check if user lookup returned an error (e.g., inactive rider)
      if (result && 'error' in result) {
        return res.redirect(`/login?error=${encodeURIComponent(result.error || 'access_denied')}`);
      }

      // User must exist in database before SSO login is allowed
      if (!result) {
        return res.redirect('/login?error=user_not_found');
      }

      const { user, userType } = result as any;

      // Store user in session
      req.session.user = {
        netid: samlUser.netid,
        email: samlUser.email,
        firstName: samlUser.firstName,
        lastName: samlUser.lastName,
      };
      req.session.authMethod = 'sso';

      // Retrieve redirect URI from session
      const redirectUri = req.session.redirectUri || '/';
      delete req.session.redirectUri;

      // Redirect to frontend with success flag
      res.redirect(`${redirectUri}?auth=sso_success`);
    } catch (err) {
      console.error('SSO callback error:', err);
      res.redirect('/login?error=sso_callback_failed');
    }
  }
);

/**
 * GET /api/sso/profile
 * Returns user profile and JWT token for SSO-authenticated users
 */
router.get('/profile', async (req: Request, res: Response) => {
  if (!req.session.user || req.session.authMethod !== 'sso') {
    return res.status(401).json({ error: 'Not authenticated via SSO' });
  }

  const netid = req.session.user.netid;
  const result = await findUserByNetID(netid);

  if (!result) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user lookup returned an error (e.g., inactive rider)
  if ('error' in result) {
    return res.status(403).json({ error: result.error });
  }

  const { user, userType } = result as any;

  // Generate JWT with same payload format as Google OAuth
  const token = sign({ id: user.id, userType }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType,
    },
    token,
    authMethod: 'sso',
  });
});

/**
 * GET /api/sso/logout
 * Destroys SSO session and clears cookies
 */
router.get('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy(() => {
      res.clearCookie('carriage.sid');
      res.redirect('/login?logout=success');
    });
  });
});

/**
 * GET /api/sso/metadata
 * Returns SAML Service Provider metadata for IdP registration
 */
router.get('/metadata', (req: Request, res: Response) => {
  res.type('application/xml');
  // Access the SAML strategy instance
  const strategy = (passport as any)._strategy('saml') as any;
  if (strategy && typeof strategy.generateServiceProviderMetadata === 'function') {
    res.send(strategy.generateServiceProviderMetadata());
  } else {
    res.status(500).send('SAML strategy not configured');
  }
});

export default router;
