const express = require("express");
const { registerUserProfile,registerUser } = require("../controllers/authController");
const { loginUser } = require("../controllers/authController");
const{get_Profile}=require("../controllers/authController");
// passport work
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID='188273928467-i92pl9svvisda5g2io87f1e3ubbqi29a.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET='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';
//
const router = express.Router();

//passport code 
const passport = require('passport');

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback   : true,
    prompt: 'select_account'  // This forces the user to select an account
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
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

