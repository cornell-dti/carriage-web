import passport from 'passport';
import { Strategy as SamlStrategy, Profile } from '@node-saml/passport-saml';
import fs from 'fs';
import path from 'path';

interface SamlProfile extends Profile {
  'urn:oid:0.9.2342.19200300.100.1.1'?: string; // netid
  'urn:oid:2.5.4.42'?: string; // firstName
  'urn:oid:2.5.4.4'?: string; // lastName
  email?: string;
}

// Load IdP certificate, necessary to authenticate with Cornell's SSO/SAML system. Get from Cornell IT or ask a previous developer.
const idpCertPath =
  process.env.SAML_IDP_CERT_PATH || './config/cornell-idp-test.crt';
let idpCert = '';
try {
  idpCert = fs.readFileSync(path.resolve(idpCertPath), 'utf-8');
} catch (error) {
  if (!process.env.SAML_IDP_CERT) {
    throw new Error('SAML_IDP_CERT is not available');
  }
  idpCert = process.env.SAML_IDP_CERT;
}

// Configure SAML strategy
const samlStrategy = new SamlStrategy(
  {
    entryPoint: process.env.SAML_ENTRY_POINT!,
    callbackUrl: process.env.SAML_CALLBACK_URL!,
    issuer: process.env.SAML_ISSUER!,
    idpCert: idpCert,
    signatureAlgorithm: 'sha256',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    // Cornell test IdP signs assertions, not responses
    wantAssertionsSigned: false,
    wantAuthnResponseSigned: false,
    // Accept unsigned for testing
    acceptedClockSkewMs: -1,
    authnContext: [
      'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
    ],
    passReqToCallback: false,
  },
  async (profile: Profile | null | undefined, done: any) => {
    try {
      if (!profile) {
        return done(new Error('No profile returned from SAML'));
      }

      const samlProfile = profile as SamlProfile;

      // Extract Cornell NetID from SAML assertion
      const netid = samlProfile['urn:oid:0.9.2342.19200300.100.1.1'];
      const email = samlProfile.email;
      const firstName = samlProfile['urn:oid:2.5.4.42'];
      const lastName = samlProfile['urn:oid:2.5.4.4'];

      if (!netid) {
        return done(new Error('NetID not found in SAML assertion'));
      }

      // User object will be stored in req.user by Passport
      const user = {
        netid,
        email,
        firstName,
        lastName,
        samlProfile: profile,
      };

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  },
  async (profile: Profile | null | undefined, done: any) => {
    // Logout callback (required by passport-saml)
    return done(null, profile);
  }
);

// Passport serialization (for session management)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use('saml', samlStrategy);

export default passport;
