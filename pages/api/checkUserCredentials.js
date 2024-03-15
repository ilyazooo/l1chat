import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        switch (req.method) {
            case 'GET':
                const { username, password } = req.query;

                // Vérifier si l'utilisateur existe
                const existingUser = await db.collection('users').findOne({ username: username });
                if (!existingUser) {
                    return res.status(400).json({ error: "Cet utilisateur n'existe pas" });
                }

                // Vérifier si le mot de passe correspond
                const passwordMatch = await bcrypt.compare(password, existingUser.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: "Les identifiants fournis sont incorrects" });
                }

                // Les identifiants sont valides
                res.status(200).json({ message: "Les identifiants sont valides" });
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