import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI, {});

    try {
        await client.connect();
        const db = client.db();

        switch (req.method) {
            case 'PUT':
                const { username1, password } = req.body;

                // Mettre à jour le mot de passe s'il est fourni
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const updatePasswordResult = await db.collection('users').updateOne({ username: username1 }, { $set: { password: hashedPassword } });
                    if (updatePasswordResult.modifiedCount === 0) {
                        return res.status(404).json({ error: `L'utilisateur avec le nom d'utilisateur ${username1} n'a pas été trouvé` });
                    }
                }

                res.status(200).json({ message: 'Modifications effectuées avec succès' });
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
