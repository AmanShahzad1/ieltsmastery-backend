const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const testsRoutes = require("./routes/tests");
//
const passport = require("passport");
const session=require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./dbConfig"); // Your PostgreSQL pool
// app.use(session({secret: "cat"}));


app.use(
  session({secret: "cat"})
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // console.log("Session:", req.session);
  next();
});
// Middleware


app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    credentials: true, // Allow cookies and sessions
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// Admin routes
app.use("/api/admin", adminRoutes);
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// })

// Use the tests routes
app.use("/api/tests", testsRoutes);
app.use("/api/createTest", testsRoutes);
//passport.js oauth work
function isLoggedIn(req,res,next){
  req.user ? next(): res.sendStatus(401);
};
// app.get('/',(req,res) => {
//   res.send('<a href ="/auth/google">Authenticate with Google</a>')
// })

app.get('/auth/google',
  passport.authenticate('google',{scope:['email','profile'],prompt: 'select_account'})
);
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
// app.get("/auth/google/callback", (req, res, next) => {
//   console.log("Google OAuth callback triggered");
//   passport.authenticate("google", (err, user, info) => {
//     if (err) {
//       console.error("Error during Google OAuth:", err);
//       return res.redirect("/auth/failure");
//     }
//     if (!user) {
//       console.error("No user returned from Google OAuth");
//       return res.redirect("/auth/failure");
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         console.error("Error logging in user:", err);
//         return res.redirect("/auth/failure");
//       }
//       console.log("User logged in successfully:", user);
//       return res.redirect("http://localhost:3000/pages/dashboard");
//     });
//   })(req, res, next);
// });

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: "http://localhost:3000/pages/dashboard", // Adjust the URL to match your frontend's host and path
    failureRedirect: '/auth/failure',
  })
);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login', // Redirect on failure
    successRedirect: 'http://localhost:3000/pages/dashboard' // Redirect on success
  })
);

app.get('/auth/failure',(req,res) =>{
res.send('Something went wrong..');
})
// app.get('/protected',isLoggedIn,(req,res)=>{
//   res.send(`Hello ${req.user.displayName}`);
// });
// app.get('/protected',isLoggedIn,(req,res)=>{
//   res.send("hello");
// });
app.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err); // Handle errors in logout
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err); // Handle errors in session destruction
      }
      res.redirect('/'); // Respond after successful logout and session destruction

    });
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});