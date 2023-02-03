import md5 from 'md5';
import { publicEncrypt, constants, privateDecrypt } from "crypto";

const encryptText = (publicKey, plainText) => {
    return publicEncrypt({
        key: publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    },
    // We convert the data string to a buffer
    Buffer.from(plainText)
    )
}
  
const decryptText = (privateKey, encryptedText) => {
    return privateDecrypt(
        {
        key: privateKey,
        // In order to decrypt the data, we need to specify the
        // same hashing function and padding scheme that we used to
        // encrypt the data in the previous step
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
        },
        encryptedText
    )
}

export function Encrypt(msg, senderPubKey, receiversPubKeys) {
    msgMd5 = md5(msg);
    if (!Array.isArray(receiversPubKeys)) receiversPubKeys = [receiversPubKeys]
    const msgObj = {
        payloadHash: msgMd5,
        s: {
            k: senderPubKey,
            c: encryptText(msg),
        },
        r: receiversPubKeys.map((pubKey) => { return {k: pubKey, p: encryptText(msg)}})
    }

    var buff = Buffer.from(JSON.stringify(msgObj)).toString("base64");
    return buff;
}

export function Dencrypt(pubKey, privateKey, data) {
    // first decode json
    let buff = new Buffer.from(data, 'base64');
    let text = buff.toString('ascii');
    const msgObj = JSON.parse(text)

    // try to find this public key in the receivers
    let pubKeyAssociatedMsg = msgObj.r.find(msg => msg.k === pubKey)

    // not found, try to see if its the sender
    if (!pubKeyAssociatedMsg && msgObj.s.k === pubKey)
    pubKeyAssociatedMsg = msgObj.s.k;

    if (!pubKeyAssociatedMsg) throw new Error("pub key not found in msg object")

    const encryptedPayload = pubKeyAssociatedMsg.p;
    const decryptedMessage = decryptText(privateKey, encryptedPayload)

    if (md5(decryptedMessage) !== msgObj.payloadHash)
    throw new Error("md5 of decrypted message doesnt match payloadHash")

    return decryptedMessage;
}