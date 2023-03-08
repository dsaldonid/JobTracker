const psPool = require('../utils/psPool')

module.exports = function(app) {
    //Description: Returns all jobs as an array with nested contacts and skills objects
    app.get('/jobs', function (req, res) {
        psPool.connect((err, client, done) => {
            const buildSkills = `'skillid', s.skillid, 'skillname', s.skillname, 'comfortlevel', s.comfortlevel`;
            const checkSkills = `[{"skillid" : null, "skillname" : null, "comfortlevel" : null}]`;

            let query = {
                text: `SELECT j.*,
                COALESCE(NULLIF(json_agg(json_build_object(${buildSkills}))::TEXT, '${checkSkills}'), '[]')::JSON
                    AS skills,
                json_agg(c)
                    AS contacts
                FROM job j
                LEFT JOIN jobskills js on j."jobId" = js.jobid
                LEFT JOIN skill s on js.skillid = s.skillid
                LEFT JOIN contact c on c.jobid = j."jobId"
                WHERE j."userId" = $1
                GROUP BY j."jobId"`,
                values: [req.userId]
            }
    
            client.query(query, (err, ps_res) => {
                done();
    
                if (err ) {
                    console.log(err.stack);
                    res.sendStatus(400);
                } else {
                    //UPDATE: Will eventually need to be nested querys here to bring in skills and contracts
                    res.status(200).json(ps_res.rows);
                }
            })
        })
    });
    
    /*  
        Description: Adds a new job entity to the database
        Example Body (JSON):
        {
            "jobTitle": "Programmer",
            "priority": 1,
            "status": "Active",
            "location": "Philadelphia",
            "notes": "Applying soon",
            "company": "Google",
            "salary": "$1,000"
        }
    */
    app.post('/jobs', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'INSERT INTO job("userId", "jobTitle", "dateCreated", priority, status, location, notes, company, "dateApplied", salary) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
                values: [req.userId, req.body.jobTitle, new Date(), req.body.priority, req.body.status, req.body.location, 
                    req.body.notes, req.body.company, req.body.dateApplied, req.body.salary]
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
        Description: Updates a job entity already existing in the database
        Example Body (JSON):
        {
            "jobTitle": "Programmer L5",
            "dateCreated": "2023-02-05T05:00:00.000Z",
            "priority": 1,
            "status": "Active",
            "location": "Bryn Mawr, PA",
            "notes": "Applied",
            "company": "Alphabet",
            "dateApplied": "2013-04-23T04:00:00.000Z",
            "salary": "$3,000.00"
        }
    */
    app.put('/jobs/:job_id', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'UPDATE job SET "jobTitle" = $2, priority = $3, status = $4, location = $5, notes = $6, company = $7, "dateApplied" = $8, salary = $9 WHERE ("userId" = $1 AND "jobId" = $10) RETURNING *',
                values: [req.userId, req.body.jobTitle, req.body.priority, req.body.status, req.body.location, 
                    req.body.notes, req.body.company, req.body.dateApplied, req.body.salary, req.params.job_id]
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
    
    //Description: Deletes a job based on the job_id defined as a URL parameter
    app.delete('/jobs/:job_id', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'DELETE FROM job WHERE ("userId" = $1 AND "jobId" = $2)',
                values: [req.userId, req.params.job_id]
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

        //Description: Creates a relationship between a job_id and a skill_id
        app.post('/jobs/:job_id/skills/:skill_id', function (req, res) {
            psPool.connect((err, client, done) => {
                let query = {
                    text: 'INSERT INTO jobskills(jobid, skillid) VALUES($1, $2) RETURNING *',
                    values: [req.params.job_id, req.params.skill_id]
                }
        
                client.query(query, (err, ps_res) => {
                    done();
        
                    if (err) {
                        console.log(err.stack);
                        res.sendStatus(400);
                    } else {
                        res.sendStatus(200);
                    }
                })
            })
        });

        //Description: Deletes a relationship between a job_id and a skill_id
        app.delete('/jobs/:job_id/skills/:skill_id', function (req, res) {
            psPool.connect((err, client, done) => {
                let query = {
                    text: 'DELETE FROM jobskills WHERE (jobid = $1 AND skillid = $2)',
                    values: [req.params.job_id, req.params.skill_id]
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