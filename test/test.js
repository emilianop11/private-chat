const { expect } = require("chai");
const {ethers} = require("ethers");
const {Encrypt, Decrypt} = require("../index");
let wallet1, wallet2, wallet3;

describe('General', function () {
    beforeEach(async function() {
        wallet1 = {
            address: "0x2Cd56A6437442a08579cDaB130e13F2b83f552b2",
            publicKey: "0x042f4da4f784a78e6e1499d5c5ce7f830126c3847429163a89621c0c2c152d1ce6c49253ce72b7e6b6ca2e45d38fc4b9b07c961fa555db1f6a74b0d4287a143e63",
            privateKey: "0x6814def1020215e2a0ba10f0cd9a357138c0099df2f5f8f7a68e6b680dd56168"
        }
        wallet2 = {
            address: "0xFBc4e867A5e42288481a945FFc5e6e9aaB4d3421",
            publicKey: "0x041ae58efd4b692559fbaa854b2f6a96470d827fa74a4b97c5c52bafde47935237be2f738ac76ebe7d4cc4b7f4c5211620f8b34975ed6e8957ed0aae602fe77aa5",
            privateKey: "0x1da9d3ead1b6a9f3e247ed321a43b625f03ddd8e4770dc7b7715b2caab3509f3"

        }
        wallet3 = {
            address: "0x14c362c45036B926534282b373237b5D9cF95af1",
            publicKey: "0x0433c20cc03218ae98eca3578c136c45ff45986c09f3f3d827ead0b7495a1366b4f4525bc47cf18e532e9e5afc43a72bc537db69046b9db0d66d0c4aaeb9f5d42f",
            privateKey: "0x7d79fdeea0a916e49a21a344d950d686e54c2d4050040769f9f2438cfdccc7c9"
        }
    })

    it('should encrypt message for a single receiver', async () => {
        const encryptedJson = await Encrypt("my test secret message", wallet1.publicKey, wallet2.publicKey)
        const endMessage1 = await Decrypt(wallet1.publicKey, wallet1.privateKey, encryptedJson);
        expect(endMessage1).to.equal("my test secret message");

        const endMessage2 = await Decrypt(wallet2.publicKey, wallet2.privateKey, encryptedJson);
        expect(endMessage2).to.equal("my test secret message");
    })

    it('should encrypt message for multiple receivers', async () => {
        const encryptedJson = await Encrypt("my test secret message", wallet1.publicKey, [wallet2.publicKey, wallet3.publicKey])
        const endMessage1 = await Decrypt(wallet1.publicKey, wallet1.privateKey, encryptedJson);
        expect(endMessage1).to.equal("my test secret message");

        const endMessage2 = await Decrypt(wallet2.publicKey, wallet2.privateKey, encryptedJson);
        expect(endMessage2).to.equal("my test secret message");

        const endMessage3 = await Decrypt(wallet3.publicKey, wallet3.privateKey, encryptedJson);
        expect(endMessage3).to.equal("my test secret message");
    })
});