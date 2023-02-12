const redirect_uri = "http://localhost"; //Update with real URL

const fetch = require('node-fetch');
const psPool = require('../utils/psPool')
const fs = require('fs')

const rawdata = fs.readFileSync('oauth.json')
const oauth = JSON.parse(rawdata);

const { OAuth2Client } = require('google-auth-library');
const oauthClient = new OAuth2Client(oauth.client_id);

async function verify(token) {
    const ticket = await oauthClient.verifyIdToken({
        idToken: token,
        audience: oauth.client_id
    });

    return ticket.getPayload();
}

module.exports = function(app) {
    /* 
        Description: Returns the OAuth redirect URL based on current settings obtained through oauth.json
        Could be constructed by client (in the future) as theres no private information here
    */
    app.get('/authorize', (req, res) => {
        res.status(200).json({ 
            "url": `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${oauth.client_id}&redirect_uri=${redirect_uri}&scope=openid%20profile`
        });
    });

    /* 
        Description: Creates or finds authenticated user, build session cookie and returns user data in JSON resposne
        Endpoint must be called with the query parameter "code" which represents the code grant provided by Google to authenticate
    */
    app.get('/token', (req, res) => {
        let code = req.query.code;

        let code_body = new URLSearchParams({
            'code': code,
            'client_id': oauth.client_id,
            'client_secret':  oauth.secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        });

        fetch("https://oauth2.googleapis.com/token", {
            method: "post",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: code_body
        })
        .then((token_resp) => {
            return token_resp.json();
        })
        .then(async (token_data) => {
            if (token_data.id_token === undefined) {
                res.status(401).json({ 'Error': 'Authorization Code was not accepted' });
            }

            const payload = await verify(token_data.id_token);

            //userId is based on the unique sub identifier provided by Google
            psPool.connect((err, client, done) => {
                let query = {
                    text: 'SELECT * FROM app_user WHERE "userId" = $1',
                    values: [payload['sub']]
                }

                client.query(query, (err, ps_res) => {
                    done();

                    if (err) {
                        console.log(err.stack);
                        res.sendStatus(400);
                    } else {
                        const session = Math.floor(
                            Math.random() * (999999999 - 1) + 1
                        );
    
                        //Must call the people API to get data to display in the browser
                        fetch("https://people.googleapis.com/v1/people/me?personFields=names", {
                            method: "get",
                            headers: {
                                "Authorization": `Bearer ${token_data.access_token}`
                            }
                        })
                        .then((resp) => {
                            return resp.json();
                        }).then((person_data) => {
                            let name = person_data.names[0];

                            psPool.connect((err, client, done) => {
                                let query;
    
                                if(ps_res.rows.length === 0) {
                                    query = {
                                        text: 'INSERT INTO app_user("userId", "firstName", "lastName", "lastLoggedIn", session) VALUES($1, $2, $3, $4, $5) RETURNING *',
                                        values: [payload['sub'], name['givenName'], name['familyName'], new Date(), session]
                                    }
                                } 
                                else {
                                    query = {
                                        text: 'UPDATE app_user SET "firstName" = $2, "lastName" = $3, "lastLoggedIn" = $4, session = $5 WHERE "userId" = $1 RETURNING *',
                                        values: [payload['sub'], name['givenName'], name['familyName'], new Date(), session]
                                    }
                                }
            
                                client.query(query, (err, ps_res) => {
                                    done();
                    
                                    if (err) {
                                        console.log(err.stack);
                                        res.sendStatus(400);
                                    } else {
                                        //Add a cookie for session to ensure it is parsed on any subsequent request
                                        res.cookie('session', session);
                                        res.status(200).json(ps_res.rows[0]);
                                    }
                                })
                            });
                        }) 
                    }
                })
            })
        })
    });
}