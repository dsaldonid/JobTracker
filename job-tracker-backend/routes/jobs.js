const psPool = require('../utils/psPool')

module.exports = function(app) {
    //Description: Returns all jobs as an array with nested contacts and skills objects (to be built)
    app.get('/jobs', function (req, res) {
        psPool.connect((err, client, done) => {
            let query = {
                text: 'SELECT * FROM job WHERE "userId" = $1',
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
}