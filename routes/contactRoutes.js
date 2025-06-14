// server.js
const express = require('express');
const router = express.Router();

const Contact = require('../models/contact');

// CRUD operations

// Create a new contact
const axios = require('axios');

router.post('/contacts', async (req, res) => {
    try {
        // Create contact in your system
        const contact = await Contact.create(req.body);

        // Prepare the Zoho API request payload
        const zohoPayload = {
            data: {
                ...req.body,  // Adjust as needed to match Zoho's expected format
            },
        };

        // Send the data to Zoho
        const zohoResponse = await axios.post(
            'https://www.zohoapis.com/crm/v2/functions/contact_us/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893',
            zohoPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Zoho-oauthtoken 1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893`, // Use the appropriate API key here
                },
            }
        );

        // Respond to the client after Zoho API response
        res.status(201).json({
            contact,
            zohoResponse: zohoResponse.data,
        });
    } catch (error) {
        console.log(error,'error')
        res.status(400).json({ error: error.message }); 
    }
});

// Read all contacts
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.findAll();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a contact by ID
router.get('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (contact) {
            res.status(200).json(contact);
        } else {
            res.status(404).json({ error: 'Contact not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a contact by ID
router.put('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (contact) {
            await contact.update(req.body);
            res.status(200).json(contact);
        } else {
            res.status(404).json({ error: 'Contact not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a contact by ID
router.delete('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (contact) {
            await contact.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Contact not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router