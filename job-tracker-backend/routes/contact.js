const express = require("express")
const Contact = require("../models/contact")
const router = express.Router()


router.get("/dashboard", async(req, res, next) => {
    try{
        // Get all user contacts
       const contact = await Contact.getAllContacts(req.userId)
       return res.status(200).json({ contact })
    } catch(err){
        next(err)
    }
})

router.post("/createContact", async(req, res, next) => {
    try{
        // Create Contact
       const contact = await Contact.createContact(req.body)
       return res.status(201).json({ contact })
    } catch(err){
        next(err)
    }
})

router.put("/updateContact", async(req, res, next) => {
    try{
        // Updates Contact
       const contact = await Contact.updateContact(req.body)
       return res.status(200).json({ contact })
    } catch(err){
        next(err)
    }
})

router.delete("/deleteContact", async(req, res, next) => {
    try{
        // Deletes Contact
        const contact = await Contact.deleteContact(req.body)
        return res.status(204).json({ contact })
    } catch(err){
        next(err)
    }
})

module.exports = router