import { MongoClient } from 'mongodb';
import { differenceInMinutes, parseISO } from 'date-fns';

export default async function handler(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI, {
       
    });

    try {
        await client.connect();
        const db = client.db();

        switch (req.method) {
            case 'GET':
                const conversations = await db.collection('messages')
                    .aggregate([
                        {
                            $group: {
                                _id: {
                                    $cond: [
                                        { $eq: ['$senderUsername', '$receiverUsername'] },
                                        '$senderUsername',
                                        '$receiverUsername'
                                    ]
                                },
                                receiverUsername: { $last: '$receiverUsername' },
                                lastMessage: { $last: '$timestamp' },
                                preview: { $last: '$content' } 
                            }
                        },
                        { $sort: { 'lastMessage': -1 } } 
                    ])
                    .toArray();
                


                    conversations.forEach(conversation => {
                        conversation.lastMessage = differenceInMinutes(new Date(), parseISO(conversation.lastMessage));
                    });

                console.log(conversations);
                res.status(200).json(conversations);
                break;

            default:
                res.status(405).end(`Méthode ${req.method} non autorisée`);
        }
    } finally {
        await client.close();
    }
}