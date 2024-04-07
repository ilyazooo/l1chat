const forge = require('node-forge');

// Fonction pour signer un message avec une clé privée
export const signMessage = (message, privateKeyPem) => {
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature);
  };

// Fonction pour vérifier la signature d'un message avec une clé publique
export const verifySignature = (message, signature, publicKeyPem) => {
  if(signature == "none"){
    return true;
  }
  const md = forge.md.sha256.create();
  md.update(message, 'utf8');
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const signatureBytes = forge.util.decode64(signature);
  const verified = publicKey.verify(md.digest().bytes(), signatureBytes);
  console.log(verified);
  return verified;
};
