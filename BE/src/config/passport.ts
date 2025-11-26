import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import * as dotenv from 'dotenv';

dotenv.config();

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        // Profile data từ Google
        if (!profile || !profile.id) {
          return done(new Error('Invalid Google profile'), undefined);
        }
        
        const userData = {
          provider: 'google' as const,
          providerId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          profilePicture: profile.photos?.[0]?.value || null,
        };
        
        return done(null, userData);
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      async (accessToken, refreshToken, profile, done) => {
        // Profile data từ Facebook
        if (!profile || !profile.id) {
          return done(new Error('Invalid Facebook profile'), undefined);
        }
        
        const userData = {
          provider: 'facebook' as const,
          providerId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          profilePicture: profile.photos?.[0]?.value || null,
        };
        
        return done(null, userData);
      }
    )
  );
}

// Serialize user for session (optional, nếu dùng session)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
