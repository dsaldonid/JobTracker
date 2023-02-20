const psPool = require("../utils/psPool");
const { UnauthorizedError, BadRequestError } = require('../utils/errors');


class Contact{
    static async getAllContacts(user){
        const requiredFields = ["id"]
        requiredFields.forEach(field => {
      if (!user.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body`)
      }
        })
    // Logic for getting all contacts
    const query = `
        SELECT *
        FROM contact
        INNER JOIN job ON contact.jobid=job."jobId"
        WHERE job."userId" = $1`
        const client = await psPool.connect()
    let contact;
        try{
            const res = await client.query(query, [user.id])
            contact = await res.rows
    } catch (err) {
            throw new BadRequestError(err.message)
    } finally {
            client.release()
    }
        return contact
  }

    static async createContact(contact){
    // Make sure user is registering with required fields in database
        const requiredFields = ["jobId", "firstName", "lastName", "email", "phone", "relationship"]
        requiredFields.forEach(field => {
      if (!contact.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body`)
      }
        })
    // Logic for creating contact
    const query = `INSERT into contact (
            "jobid",
            "firstname",
            "lastname",
            email,
            phone,
            relationship,
            notes,
            followupdates
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING "jobid", "firstname", "lastname", email, phone, relationship, notes, followupdates`

        const client = await psPool.connect()
    let result;
        const date = contact.followupDates? new Date(contact.followupDates) : null
        try{
            const res = await client.query(query, [contact.jobId, contact.firstName, contact.lastName, contact.email, contact.phone, contact.relationship, contact.notes, date])
            result = await res.rows[0]
    } catch (err) {
            throw new BadRequestError(err.message)
    } finally {
            client.release()
    }

        return result
  }

  static async updateContact(contact) {
    // Logic for updating contact
    const query = `UPDATE contact 
        SET "jobid" = $1,
        "firstname" = $2, 
        "lastname" = $3, 
        email = $4, 
        phone = $5,  
        relationship = $6, 
        notes = $7,
        "followupdates" = $8 
        WHERE contactid = $9
        RETURNING *`

        const client = await psPool.connect()
    let result;
        try{
            const res = await client.query(query, [contact.jobId, contact.firstName, contact.lastName, contact.email, contact.phone, contact.relationship, contact.notes, new Date(contact.followupDates), contact.contactId])
            result = res.rows[0]
    } catch (err) {
            console.log(err.stack)
    } finally {
            client.release()
    }

        return result
  }

  static async deleteContact(contact) {
        console.log(contact)
    // Logic for deleting contact
        const query = `DELETE FROM contact WHERE "contactid" = $1`

        const client = await psPool.connect()
    let result;
        try{
            const res = await client.query(query, [contact.id])
            result = res.rows[0]
    } catch (err) {
            console.log(err.stack)
    } finally {
            client.release()
    }

        return result
  }
}

module.exports = Contact;