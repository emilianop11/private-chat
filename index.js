const md5 = require('md5');
const EthCrypto = require('eth-crypto');

const encryptText = async (publicKey, plainText) => {
    publicKey = publicKey.replace("0x", "")
    encryptedData = await EthCrypto.encryptWithPublicKey(
        publicKey,
        plainText
    );
    return EthCrypto.cipher.stringify(encryptedData)
}
  
const decryptText = async (privateKey, encryptedText) => {
    privateKey = privateKey.replace("0x", "")
    const data = EthCrypto.cipher.parse(encryptedText)
    return await EthCrypto.decryptWithPrivateKey(
        privateKey,
        data
    );
}

exports.Encrypt = async (msg, senderPubKey, receiversPubKeys) => {
    msgMd5 = md5(msg);
    if (!Array.isArray(receiversPubKeys)) receiversPubKeys = [receiversPubKeys]
    const receivers = await Promise.all(receiversPubKeys.map(async (pubKey) => { return {k: pubKey, p: await encryptText(pubKey, msg)}}));

    const msgObj = {
        payloadHash: msgMd5,
        s: {
            k: senderPubKey,
            p: await encryptText(senderPubKey, msg),
        },
        r: receivers
    }

    var buff = Buffer.from(JSON.stringify(msgObj)).toString("base64");
    return buff;
}

exports.Decrypt = async (pubKey, privateKey, data) => {
    // first decode json
    let buff = new Buffer.from(data, 'base64');
    let text = buff.toString('ascii');
    const msgObj = JSON.parse(text)

    // try to find this public key in the receivers
    let pubKeyAssociatedMsg = msgObj.r.find(msg => msg.k === pubKey)

    // not found, try to see if its the sender
    if (!pubKeyAssociatedMsg && msgObj.s.k === pubKey)
    pubKeyAssociatedMsg = msgObj.s;

    if (!pubKeyAssociatedMsg) throw new Error("pub key not found in msg object")

    const encryptedPayload = pubKeyAssociatedMsg.p;
    const decryptedMessage = await decryptText(privateKey, encryptedPayload)
    if (md5(decryptedMessage) !== msgObj.payloadHash)
    throw new Error("md5 of decrypted message doesnt match payloadHash")

    return decryptedMessage;
}