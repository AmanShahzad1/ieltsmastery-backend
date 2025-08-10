const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const testsRoutes = require("./routes/tests");
const planRoutes = require("./routes/plans");
const performanceRoutes = require("./routes/performance");
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
app.use("/api/plans", planRoutes);
app.use("/api/performance", performanceRoutes);
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

app.get('api/auth/google',
  passport.authenticate('google',{scope:['email','profile'],prompt: 'select_account'})
);
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));


// app.get('/auth/google/callback',
//   passport.authenticate('google', {
//     successRedirect: "http://localhost:3000/pages/dashboard", // Adjust the URL to match your frontend's host and path
//     failureRedirect: '/auth/failure',
//   })
// );

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    if (req.user?.token) {
      // Redirect to a callback page with token in URL hash
      res.redirect(`http://localhost:3000/pages/oauth-callback#token=${req.user.token}`);
    } else {
      res.redirect('http://localhost:3000/pages/login?error=oauth_failed');
    }
  }
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
