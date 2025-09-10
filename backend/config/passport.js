const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Make sure environment variables are loaded
require('dotenv').config();

// JWT Strategy for API authentication
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret-for-development'
}, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.userId);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 'oauthProviders.google.id': profile.id });
      
      if (user) {
        // User exists, update their info if needed
        if (!user.oauthProviders.google.email || user.oauthProviders.google.email !== profile.emails[0].value) {
          user.oauthProviders.google.email = profile.emails[0].value;
          await user.save();
        }
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists with same email, link the Google account
        user.oauthProviders.google = {
          id: profile.id,
          email: profile.emails[0].value
        };
        user.isVerified = true; // Auto-verify if they have Google account
        await user.save();
        return done(null, user);
      }

      // Create new user
      const newUser = new User({
        email: profile.emails[0].value,
        profile: {
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          profilePicture: profile.photos[0]?.value || ''
        },
        oauthProviders: {
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        },
        isVerified: true, // Auto-verify Google users
        isActive: true
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not found in environment');
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this LinkedIn ID
      let user = await User.findOne({ 'oauthProviders.linkedin.id': profile.id });
      
      if (user) {
        // User exists, update their info if needed
        if (!user.oauthProviders.linkedin.email || user.oauthProviders.linkedin.email !== profile.emails[0].value) {
          user.oauthProviders.linkedin.email = profile.emails[0].value;
          await user.save();
        }
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists with same email, link the LinkedIn account
        user.oauthProviders.linkedin = {
          id: profile.id,
          email: profile.emails[0].value
        };
        user.isVerified = true; // Auto-verify if they have LinkedIn account
        await user.save();
        return done(null, user);
      }

      // Create new user with LinkedIn profile data
      const newUser = new User({
        email: profile.emails[0].value,
        profile: {
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          headline: profile.headline || '',
          summary: profile.summary || '',
          location: profile.location?.name || '',
          industry: profile.industry || '',
          profilePicture: profile.photos[0]?.value || ''
        },
        oauthProviders: {
          linkedin: {
            id: profile.id,
            email: profile.emails[0].value
          }
        },
        isVerified: true, // Auto-verify LinkedIn users
        isActive: true
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('LinkedIn OAuth not configured - LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET not found in environment');
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
