import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


function generateAuthToken(username) {
    
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        const existingUser = await db.collection('users').findOne({ username });

        if (!existingUser) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const authToken = generateAuthToken(username);

        return res.status(200).json({ message: 'Login successful', token: authToken });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });

    } finally {
        await client.close();
    }
}