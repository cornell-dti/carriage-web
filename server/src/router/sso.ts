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
  const redirectUri =
    (req.query.redirect_uri as string) ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000';
  const userType = (req.query.userType as string) || 'Rider';

  // CRITICAL: Encode userType and redirectUri into RelayState to survive SAML redirect
  // RelayState is the SAML standard way to preserve application state
  const relayState = JSON.stringify({ userType, redirectUri });
  console.log('[SSO Login] Creating RelayState:', relayState);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Use any type to bypass TypeScript limitation with additionalParams
  const authOptions: any = {
    failureRedirect: `${frontendUrl}/?error=sso_failed`,
    additionalParams: {
      RelayState: relayState,
    },
  };

  passport.authenticate('saml', authOptions)(req, res, next);
});

/**
 * POST /api/sso/callback
 * SAML assertion consumer endpoint (receives SAML response from IdP)
 */
router.post(
  '/callback',
  passport.authenticate('saml', {
    failureRedirect: `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/?error=sso_failed`,
  }),
  async (req: Request, res: Response) => {
    try {
      const samlUser = req.user as any;
      const netid = samlUser.netid;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Extract RelayState from POST body (SAML standard for preserving state)
      const relayStateString = req.body.RelayState;
      console.log('[SSO Callback] RelayState received:', relayStateString);

      if (!relayStateString) {
        console.error(
          '[SSO Callback] No RelayState found - cannot determine user type'
        );
        return res.redirect(`${frontendUrl}/?error=missing_user_type`);
      }

      let requestedUserType: string;
      let redirectUri = frontendUrl;

      try {
        const relayState = JSON.parse(relayStateString);
        requestedUserType = relayState.userType;
        redirectUri = relayState.redirectUri || frontendUrl;

        if (!requestedUserType) {
          console.error('[SSO Callback] RelayState missing userType');
          return res.redirect(`${frontendUrl}/?error=missing_user_type`);
        }
      } catch (e) {
        console.error('[SSO Callback] Failed to parse RelayState:', e);
        return res.redirect(`${frontendUrl}/?error=invalid_relay_state`);
      }

      console.log('[SSO Callback] NetID:', netid);
      console.log('[SSO Callback] Requested UserType:', requestedUserType);

      // Lookup user in database with specific userType filter
      const result = await findUserByNetID(netid, requestedUserType);
      console.log(
        '[SSO Callback] findUserByNetID result:',
        JSON.stringify(result, null, 2)
      );

      // Check if user lookup returned an error (e.g., inactive rider)
      if (result && 'error' in result) {
        return res.redirect(
          `${frontendUrl}/?error=${encodeURIComponent(
            result.error || 'access_denied'
          )}`
        );
      }

      // User must exist in database before SSO login is allowed
      if (!result) {
        return res.redirect(`${frontendUrl}/?error=user_not_found`);
      }

      const { userType } = result as any;

      // Store user in session
      req.session.user = {
        netid: samlUser.netid,
        email: samlUser.email,
        firstName: samlUser.firstName,
        lastName: samlUser.lastName,
      };
      req.session.authMethod = 'sso';
      // CRITICAL: Store the validated userType in session for /profile endpoint
      req.session.userType = userType;
      console.log('[SSO Callback] Stored userType in session:', userType);

      // Redirect to frontend with success flag
      res.redirect(`${redirectUri}?auth=sso_success`);
    } catch (err) {
      console.error('SSO callback error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?error=sso_callback_failed`);
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
  const sessionUserType = req.session.userType;
  console.log('[SSO Profile] NetID:', netid);
  console.log('[SSO Profile] UserType from session:', sessionUserType);

  // Use the validated userType from session (set during callback)
  const result = await findUserByNetID(netid, sessionUserType);
  console.log(
    '[SSO Profile] findUserByNetID result:',
    JSON.stringify(result, null, 2)
  );

  if (!result) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user lookup returned an error (e.g., inactive rider)
  if ('error' in result) {
    return res.status(403).json({ error: result.error });
  }

  const { user, userType } = result as any;
  console.log('[SSO Profile] UserType from result:', userType);
  console.log('[SSO Profile] User ID:', user.id);

  // Generate JWT with same payload format as Google OAuth
  const token = sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: '7d',
  });
  console.log('[SSO Profile] Generated JWT with userType:', userType);

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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy(() => {
      res.clearCookie('carriage.sid');
      res.redirect(`${frontendUrl}/?logout=success`);
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
  if (
    strategy &&
    typeof strategy.generateServiceProviderMetadata === 'function'
  ) {
    res.send(strategy.generateServiceProviderMetadata());
  } else {
    res.status(500).send('SAML strategy not configured');
  }
});

export default router;
