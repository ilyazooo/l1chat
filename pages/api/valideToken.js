import jwt from 'jsonwebtoken';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const authToken = req.headers.authorization?.split(' ')[1];

    if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        return res.status(200).json(decoded);
    } catch (error) {
        console.log({ error: 'Invalid token' })
        return res.status(401).json({ error: 'Invalid token' });
    }
}