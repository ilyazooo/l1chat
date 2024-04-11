import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    let client;

    try {
        
        const { username } = req.query; 

        
        client = new MongoClient(process.env.MONGODB_URI, {});
        await client.connect();
        const db = client.db();

    
        const user = await db.collection('users').findOne({ username: username });

        if (!user) {
           
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

   
        const isVerified = user.isVerified || false;

        
        res.status(200).json({ isVerified: isVerified });
    } catch (error) {
       
        console.error('Erreur lors de la vérification de la vérification de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de la vérification de l\'utilisateur' });
    } finally {
       
        if (client) {
            await client.close();
        }
    }
}