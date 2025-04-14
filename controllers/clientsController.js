const Client = require('../model/Client'); // Adjust the path if necessary

const createNewClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients); // Return all clients
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(client); // Return the client
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(client); // Return the updated client
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(204).send(); // No content, client successfully deleted
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllClients,
    createNewClient,
    updateClient,
    deleteClient,
    getClientById
}
