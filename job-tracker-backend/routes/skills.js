const psPool = require('../utils/psPool')

module.exports = function(app) {
    //Description: Returns all skills for user as an array
    app.get('/skills', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'SELECT * FROM skill WHERE "userId" = $1',
                values: [req.userId]
            }
    
            client.query(query, (err, ps_res) => {
                done();
    
                if (err ) {
                    console.log(err.stack);
                    res.sendStatus(400);
                } else {
                    res.status(200).json(ps_res.rows);
                }
            })
        })
    });
    
    /*  
        Description: Adds a new skill entity to the database
        Example Body (JSON):
        {
            "skillName": "PostgreSQL",
            "comfortLevel": 100
        }
    */
    app.post('/skills', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'INSERT INTO skill("userId", "skillname", "comfortlevel") VALUES($1, $2, $3) RETURNING *',
                values: [req.userId, req.body.skillName, req.body.comfortLevel]
            }
    
            client.query(query, (err, ps_res) => {
                done();
    
                if (err) {
                    console.log(err.stack);
                    res.sendStatus(400);
                } else {
                    res.status(201).json(ps_res.rows[0]);
                }
            })
        })
    });
    
    /*  
        Description: Updates a skill entity already existing in the database
        Example Body (JSON):
        {
            "skillName: "postgresSQL",
            "comfortLevel": 0
        }
    */
    app.put('/skills/:skill_id', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'UPDATE skill SET skillname = $2, comfortlevel = $3 WHERE ("userId" = $1 AND skillid = $4) RETURNING *',
                values: [req.userId, req.body.skillName, req.body.comfortLevel, req.params.skill_id]
            }
    
            client.query(query, (err, ps_res) => {
                done();
    
                if (err) {
                    console.log(err.stack);
                    res.sendStatus(400);
                } else {
                    res.status(200).json(ps_res.rows[0]);
                }
            })
        })
    });
    
    //Description: Deletes a skill based on the skill_id defined as a URL parameter
    app.delete('/skills/:skill_id', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'DELETE FROM skill WHERE ("userId" = $1 AND skillid = $2)',
                values: [req.userId, req.params.skill_id]
            }
    
            client.query(query, (err, ps_res) => {
                done();
    
                if (err) {
                    console.log(err.stack);
                    res.sendStatus(400);
                } else {
                    res.sendStatus(204);
                }
            })
        })
    });
}