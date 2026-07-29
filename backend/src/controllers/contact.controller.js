const contactService = require('../services/contact.service');

const submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }
        
        await contactService.saveMessage({ name, email, message });
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await contactService.getMessages();
        res.json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    submitContact,
    getMessages
};
