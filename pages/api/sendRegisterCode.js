import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    try {
        const { username } = req.body;

        const email = await getEmailByUsername(username);

        if (!email) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        let verificationCode = await getVerificationCodeByUsername(username);

        if (!verificationCode) {
            
            verificationCode = Math.floor(100000 + Math.random() * 900000);
            await storeVerificationCodeInDatabase(username, verificationCode);
        }

        await sendVerificationCodeByEmail(email, verificationCode);

        res.status(200).json({ message: 'Code de vérification envoyé avec succès par e-mail' });
    } catch (error) {
        
        res.status(500).json({ error: 'Erreur lors de l\'envoi du code de vérification par e-mail' });
    }
}

async function getEmailByUsername(username) {
    const client = new MongoClient(process.env.MONGODB_URI, {});
    await client.connect();
    const db = client.db();

    const user = await db.collection('users').findOne({ username: username });

    await client.close();

    return user ? user.email : null;
}

async function getVerificationCodeByUsername(username) {
    const client = new MongoClient(process.env.MONGODB_URI, {});
    await client.connect();
    const db = client.db();

    const codeRecord = await db.collection('registerCode').findOne({ username: username });

    await client.close();

    return codeRecord ? codeRecord.verificationCode : null;
}

async function sendVerificationCodeByEmail(email, verificationCode) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'ilyassdu78260hr@hotmail.fr',
            pass: 'rabat2014',
        },
        tls: {
            ciphers: 'SSLv3',
        },
    });

    const mailOptions = {
        from: 'L1Chat',
        to: email,
        subject: 'Votre code de vérification L1CHAT',
        text: `Votre code de vérification est : ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
}

async function storeVerificationCodeInDatabase(username, verificationCode) {
    const client = new MongoClient(process.env.MONGODB_URI, {});
    await client.connect();
    const db = client.db();

    await db.collection('registerCode').insertOne({
        username: username,
        verificationCode: verificationCode,
        createdAt: new Date(),
    });

    await client.close();
}
