const PinataStorageService = require("./pinataStorageService.js");
const RealEstateStorageService = require("./realEstateStorageService.js");
const RealEstateTokenFactory = require("./realEstateTokenFactory.js");
const RealEstateUploadData = require("./realEstateUploadData.js");
const { ethers } = require("ethers");
const { readFileSync } = require('fs');
const path = require('path');

class RealEstateTokenFactoryFacade {
    constructor() {
        this.apiKey = '007cc80ed8bdb18134b8';
        this.apiSecret = '21c4c0dcabcced58efbb4104b94d82b6826ce277308bd818529911260ff13534';

        const realEstateContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        // Local Hardhat network
        const provider =
            new ethers.providers.JsonRpcProvider("http://localhost:8545");

        console.log("provider =", provider);

        const RealEstateContractABI = JSON.parse(
            readFileSync(path.resolve('backend', 'abis', 'RealEstate.json'), 'utf8')
        );

        console.log("RealEstateContractABI= ", RealEstateContractABI);

        const realEstateContract = new ethers.Contract(
            realEstateContractAddress, RealEstateContractABI, provider);

        const pinataStorageService =
            new PinataStorageService(this.apiKey, this.apiSecret);

        const realEstateStorageService =
            new RealEstateStorageService(pinataStorageService);

        this.realEstateFactory = new RealEstateTokenFactory(
            realEstateStorageService, realEstateContract);
    }

    async uploadAndMint(signer, id, imageStream, name, description, attributes) {
        const realEstateUploadData = new RealEstateUploadData(
            id, imageStream, name, description, attributes);

        let [metadataCID, imageCID] =
            await this.realEstateFactory.uploadAndMint(signer, realEstateUploadData);

        return [metadataCID, imageCID];
    }
}

module.exports = RealEstateTokenFactoryFacade;