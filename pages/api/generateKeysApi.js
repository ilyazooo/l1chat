const crypto = require('crypto');

export default async function handler(req, res) {
    try {
        // Générer une paire de clés RSA
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            }
        });

        // Renvoyer les clés sous forme de réponse JSON
        res.status(200).json({ publicKey, privateKey });
    } catch (error) {
        console.error('Erreur lors de la génération des clés:', error);
        res.status(500).json({ message: 'Erreur lors de la génération des clés' });
    }
}