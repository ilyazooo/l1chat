import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default async function handler(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI, {});

    try {
        await client.connect();
        const db = client.db();

        switch (req.method) {
            case 'POST':
                const { username, email, password, publicKey } = req.body;
                console.log('Contenu du req.body:', req.body);

         


                const existingUser = await db.collection('users').findOne({ username: username });
                if (existingUser) {
                   
                    return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
                }

                const existingEmail = await db.collection('users').findOne({ email: email });
                if (existingEmail) {
                    
                    return res.status(401).json({ error: 'Cet email est déjà utilisé' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const result = await db.collection('users').insertOne({
                    username: username,
                    email: email,
                    password: hashedPassword,
                    publicKey: publicKey,
                    isVerified: false
                });

       

                if (result && result.insertedCount === 1) {
                    return res.status(201).json({ message: 'Compte créé avec succès' });
                } else {
                    console.error("Erreur lors de l'insertion du compte dans la base de données :", result);
                    return res.status(500).json({ error: 'Erreur lors de la création du compte' });
                }

            default:
                return res.status(405).end(`Méthode ${req.method} non autorisée`);
        }
    } catch (error) {
        console.error('Erreur lors de la requête:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        await client.close();
    }
}
