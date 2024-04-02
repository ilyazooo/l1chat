const forge = require('node-forge');

// Fonction pour signer un message avec une clé privée
export const signMessage = (message, privateKeyPem) => {
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    // Convertir la clé privée PEM en une instance de clé privée forge
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    // Utiliser la méthode sign de l'instance de clé privée
    const signature = privateKey.sign(md);
    // Encoder la signature en format lisible (par exemple, base64)
    return forge.util.encode64(signature);
  };

// Fonction pour vérifier la signature d'un message avec une clé publique
export const verifySignature = (message, signature, publicKeyPem) => {
  if(signature == "none"){
    return true;
  }
  const md = forge.md.sha256.create();
  md.update(message, 'utf8');
  //console.log(message);
  //console.log(publicKeyPem);
  // Convertir la clé publique en format PEM en objet PublicKey de node-forge
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  //console.log(publicKey);
  //console.log(signature);
  const signatureBytes = forge.util.decode64(signature);
  const verified = publicKey.verify(md.digest().bytes(), signatureBytes);
  console.log(verified);
  return verified;
};