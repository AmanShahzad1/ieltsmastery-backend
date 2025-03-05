const express = require("express");
const { registerUserProfile,registerUser } = require("../controllers/authController");
const { loginUser } = require("../controllers/authController");
<<<<<<< HEAD
const{get_Profile}=require("../controllers/authController");
=======

>>>>>>> 74325b3552f47cc4050690a563ccd04cf913e8db
// passport work
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const { findUserByEmailOrPhone, insertUser } = require("../models/userModel");
const GOOGLE_CLIENT_ID='188273928467-i92pl9svvisda5g2io87f1e3ubbqi29a.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET='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';
const FACEBOOK_APP_ID='948131240706775';
const FACEBOOK_APP_SECRET='bc7bf820825a3a6501676a39974ae7d3';
//
const router = express.Router();

//passport code 
const passport = require('passport');
// for google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
      prompt: "select_account",
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);

        // Check if the user already exists in the database
        const existingUser = await findUserByEmailOrPhone(profile.emails[0].value);
        console.log("Existing User:", existingUser);

        if (existingUser) {
          // If the user exists, return the user
          return done(null, existingUser);
        } else {
          // If the user doesn't exist, create a new user in the database
          const newUser = await insertUser(
            profile.displayName, // Username
            profile.emails[0].value, // Email
            null // Password (null for Google OAuth users)
          );
          console.log("New User Inserted:", newUser);

          if (!newUser) {
            throw new Error("Failed to insert user into the database");
          }

          return done(null, newUser);
        }
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);

//facebook login
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:5000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

passport.serializeUser(function(user,done)
{
    done(null,user);

});
passport.deserializeUser(function(user,done)
{
    done(null,user);
    
});

// POST: Register a new user
router.post("/register", registerUser);
// POST: create profile a new user
router.post("/user-profile", registerUserProfile)
// Login authentication
router.post("/login", loginUser);

router.get("/get-profile/:user_id", get_Profile);

module.exports = router;

