const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser");

const fs = require('fs')
const psPool = require('./psPool')

// Create instance of express application
const app = express()

// Enable cross-origin resource sharing for all origins
app.use(cors())

// Parse request with JSON payload
app.use(express.json())

// Log request throughout app
app.use(morgan("tiny"))

//Add routes for user authentication
require('./auth')(app);

//Parse cookies for session management
app.use(cookieParser())

//Middleware function to verify sessionId and attach user information to request
function sessionVerifier(req, res, next) {
    const sessionId = req.cookies['session'];

    psPool.connect((err, client, done) => {
        let query = {
            text: 'SELECT "userId" FROM app_user WHERE session = $1',
            values: [sessionId]
        }

        client.query(query, (err, ps_res) => {
            done();

            if (err || ps_res.rows.length === 0) {
                console.log(err.stack);

                res.status(401).json({ 'Error': 'Unauthorized due to invalid session' });
            } else {
                //req.userId can be used in downstream calls after middleware is used
                req.userId = ps_res.rows[0].userId;
                next()
            }
        })
    })
}

//Configure session middleware after authentication
app.use(sessionVerifier);

//Calling the express.json() method for parsing JSON on future calls
app.use(express.json());

//Creates GET, POST, PUT and DELETE endpoints for /jobs
require('./jobs')(app);

// Will change when we move our app to GCP
const port = 3000

app.listen(port, () => {
    console.log('Server listening in port ' + port)
})