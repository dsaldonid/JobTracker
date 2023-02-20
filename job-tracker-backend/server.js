const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/altAuth");
const { NotFoundError } = require("./utils/errors");
const cookieParser = require("cookie-parser");
const contactRoutes = require("./routes/contact");

const fs = require("fs");
const psPool = require("./utils/psPool");

// Create instance of express application
const app = express();

// Enable cross-origin resource sharing for all origins
app.use(cors());

// Parse request with JSON payload
app.use(express.json());

// Log request throughout app
app.use(morgan("tiny"));

//Add routes for user authentication
require("./routes/auth")(app);

// Add routes for non-google user authentication
app.use("/altAuth", authRoutes);

// Creating one route
app.get("/", async (req, res, next) => {
  res.status(200).json({ ping: "pong" });
});
//Parse cookies for session management
app.use(cookieParser());

//Middleware function to verify sessionId and attach user information to request
function sessionVerifier(req, res, next) {
  console.log("auth: ", req.headers);
  if (!req.headers.authorization) {
    res.status(401).json({
      Error: "Unauthorized due to invalid session: insert authorization header",
    });
    return;
  }
  const auth_session = req.headers.authorization.substring("Bearer ".length);
  console.log("what are the req cookies: ", req.cookies, auth_session);
  console.log(
    "what are the auth_session cookies: ",
    auth_session,
    typeof auth_session
  );
  const sessionId = req.cookies["session"];

  psPool.connect((err, client, done) => {
    let query = {
      text: 'SELECT "userId" FROM app_user WHERE session = $1',
      //   values: [sessionId],
      values: [auth_session],
    };

    client.query(query, (err, ps_res) => {
      done();

      if (err || ps_res.rows.length === 0) {
        if (err) console.log(err.stack);

        res.status(401).json({ Error: "Unauthorized due to invalid session" });
      } else {
        //req.userId can be used in downstream calls after middleware is used
        req.userId = ps_res.rows[0].userId;
        next();
      }
    });
  });
}

//Configure session middleware after authentication
app.use(sessionVerifier);

//Calling the express.json() method for parsing JSON on future calls
app.use(express.json());

// Add routes for contact functionality
app.use("/contact", contactRoutes);

//Creates GET, POST, PUT and DELETE endpoints for /jobs
require("./routes/jobs")(app);

// If no routes are touched then we will get a 404 error
app.use((req, res, next) => {
  return next(new NotFoundError());
});

// Gives message on error as a responds if hit
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

//process.env.PORT used for GCP
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log("Server listening in port " + PORT);
});
