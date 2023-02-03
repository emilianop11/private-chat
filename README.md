# private-chat

This is a js library to encrypt and decrypt messages that are private between two or more adresses in the blockchain. To have more context refer to: https://github.com/emilianop11/private-blockchain-chat This payload is what the chat struct in the contract will store in the messages array.
This library will act as a helper for the sender and receiver parties so they can encrypt and decrypt the messages that flow between them.
Notice that all of this encryption and decryption is happening off chain, client side. On chain we are just storing the payload which is a base64 encoded stringified json with this format
{
    payloadHash: "md5 of unencrypted content"
    s: {
        p: "public key of sender",
        c: "encryptedDataString",
    }
    r: [{
        p: "public key of receiver",
        c: "encryptedDataString"
    }]
}

payloadHash: we prefer md5 instead of sha256 since its shorter. this field is
used to make sure that the same string is being encrypted for all parties. So all decrypting parties can check the result they got against this hash.

"s" stands for sender
"r" stands for receiver
"c" stands for content

The encryption algorithm is as follows:

1) take the desired message that the address wants to send, and compute the md5 hash of the content. This will be stored in payloadHash

2) take the desired message that the address wants to send and encrypt it n + 1 times. Where n is the amount of receivers. Each encryption should use the recipients public key (from where do we get the pubkey of receipients? read below) and one for the sender.

3) construct the json as described above and base64 encode it.


The decryption algorithm is as follows:

1) take the incoming payload and base64 decode it

2) search through the recipients (or senders) the matching public key that the decoding party owns.

3) decrypt the "c" field using the recipients private key

4) compute the md5 hash of the decrypted message and check that it equals the payloadHash


## retrieving the publickey of an address that will receive the message

this is a problem that still needs an elegant solution.
In the first implementation, and address before getting involved in a chat would need to call a smart contract (lets call it pubkey mapper) where they will send their public key as a parameter in the tx. The smart contract will store the mapping between the address and the pubkey
Any sender that wants to send a message to an address would need to query the contract to retrieve the pubkey.
This also has the benefit that any address wont be able to receive messages until their owner explicitly called the pukkey mapper contract