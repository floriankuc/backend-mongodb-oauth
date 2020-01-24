const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

//ROUTE HANDLER
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback", //HANDLING AUTH ROUTE REDIRECT
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      //CREATE NEW USER WITH USER SCHEMA
      const existingUser = await User.findOne({
        googleId: profile.id
      });

      if (existingUser) {
        //THERE IS AN EXISTING USER
        return done(null, existingUser);
      }
      const user = await new User({ googleId: profile.id }).save(); //save() saved USER TO MONGODB
      done(null, user);
    }
  )
);
