const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Validate Google OAuth environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is required but not set in environment variables');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is required but not set in environment variables');
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;
    const avatar = photos[0]?.value || null;

    // Check if user exists by email
    let user = await User.findOne({ email });

    if (user) {
      // User exists but doesn't have googleId - link the account
      if (!user.googleId) {
        user.googleId = id;
        user.avatar = avatar;
        user.isEmailVerified = true; // Google accounts are pre-verified
        await user.save();
      }
      return done(null, user);
    } else {
      // Create new user
      user = new User({
        name: displayName,
        email,
        googleId: id,
        avatar,
        isEmailVerified: true, // Google accounts are pre-verified
        isActive: true
      });
      
      await user.save();
      return done(null, user);
    }
  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;