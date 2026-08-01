const contactService = require('../services/contact.service');

const submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }
        
        await contactService.saveMessage({ name, email, message });

        // Trigger Admin Notification
        const { createAdminNotification } = require('../services/notification.service');
        await createAdminNotification({
            title: 'New Support Contact Message',
            message: `New message from ${name} (${email}): "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
            type: 'contact_message',
            priority: 'normal'
        });

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

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await contactService.deleteMessage(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    submitContact,
    getMessages,
    deleteMessage
};
