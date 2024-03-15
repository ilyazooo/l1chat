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
                const senderUsername = req.query.senderUsername;

                const conversations = await db.collection('messages')
                    .aggregate([
                        {
                            $match: {
                                $or: [
                                    { senderUsername: senderUsername },
                                    { receiverUsername: senderUsername }
                                ],
                                cryptedFromKeyOf: senderUsername
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $cond: [
                                        { $eq: ['$senderUsername', senderUsername] },
                                        '$receiverUsername',
                                        '$senderUsername'
                                    ]
                                },
                                receiverUsername: { $last: '$receiverUsername' },
                                senderUsername: { $last: '$senderUsername' },
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

                res.status(200).json(conversations);
                break;

            default:
                res.status(405).end(`Méthode ${req.method} non autorisée`);
        }
    } finally {
        await client.close();
    }
}
