import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        switch (req.method) {
            case 'GET':
                const { username } = req.query;

                if (!username) {
                    return res.status(400).json({ error: 'Le nom d\'utilisateur est requis' });
                }

                const existingUser = await db.collection('users').findOne({ username });

                if (existingUser) {
                    res.status(200).json({ exists: true });
                } else {
                    res.status(200).json({ exists: false });
                }
                break;

            default:
                res.status(405).end(`Méthode ${req.method} non autorisée`);
        }
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        await client.close();
    }
}