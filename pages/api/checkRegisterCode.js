import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    let client;

    try {
      
        const { verificationCode, username } = req.body;

   
        client = new MongoClient(process.env.MONGODB_URI, {});
        await client.connect();
        const db = client.db();

        const storedCode = await db.collection('registerCode').findOne({ username: username });

        console.log("Stored Code"+ storedCode);

        if (storedCode.verificationCode != verificationCode) {
            
            return res.status(400).json({ error: 'Code de vérification incorrect' });
        }

    
        await db.collection('users').updateOne({ username: username }, { $set: { isVerified: true } });

        res.status(200).json({ message: 'Code de vérification correct' });
    } catch (error) {
        
        console.error('Erreur lors de la vérification du code de vérification :', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du code de vérification' });
    } finally {
        
        if (client) {
            await client.close();
        }
    }
}
