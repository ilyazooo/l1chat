import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI, {
       
    });

    try {
        await client.connect();
        const db = client.db();

        switch (req.method) {
            case 'GET':
                const { senderUsername, receiverUsername } = req.query;

                if (!senderUsername || !receiverUsername) {
                    return res.status(400).json({ error: 'Les identifiants de l\'expéditeur et du destinataire sont requis' });
                }


                const messages = await db.collection('messages')
                .find({
                    $or: [
                      { senderUsername: senderUsername, receiverUsername: receiverUsername },
                      { senderUsername: receiverUsername, receiverUsername: senderUsername },
                    ],
                    cryptedFromKeyOf: senderUsername 
                  })
                  .sort({ timestamp: 1 })
                  .toArray();
                

                
                res.status(200).json(messages);
                break;


            case 'POST':
                    const newMessage = req.body;
                    const result = await db.collection('messages').insertOne(newMessage);
                
                    if (result) {
                        res.status(201).json(result);
                    } else {
                        res.status(500).json({ error: 'Erreur lors de la création du message' });
                    }
                    break;

            case 'PUT':

                const { messageId, ...updateData } = req.body;
                const result2 = await db.collection('messages').updateOne(
                    { _id: new ObjectId(messageId) },
                    { $set: updateData }
                );
                res.status(200).json(result2);
                break;

            case 'DELETE':

                const result3 = await db.collection('messages').deleteOne({
                    _id: new ObjectId(req.body.messageId),
                });
                res.status(200).json(result3);
                break;

            default:
                res.status(405).end(`Méthode ${req.method} non autorisée`);
        }
    } finally {
        await client.close();
    }
}