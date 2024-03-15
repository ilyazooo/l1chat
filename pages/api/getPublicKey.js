import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { receiverUsername } = req.query;

    if (!receiverUsername) {
        return res.status(400).json({ error: 'Receiver username is required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        const user = await db.collection('users').findOne({ username: receiverUsername });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Assuming the user document has a field called publicKey
        const publicKey = user.publicKey;

        return res.status(200).json({ publicKey });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });

    } finally {
        await client.close();
    }
}