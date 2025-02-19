import PinataStorageService from "./pinataStorageService.js";
import RealEstateStorageService from "./realEstateStorageService.js";
import RealEstateTokenFactory from "./realEstateTokenFactory.js";
import RealEstateUploadData from "./realEstateUploadData.js";
import { ethers } from "ethers";
import { readFileSync } from 'fs';
import path from 'path';

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

    async uploadAndMint(signer, id, image, name, description, attributes) {
        //todo: image to imageStream
        const realEstateUploadData = new RealEstateUploadData(
            id, image, name, description, attributes);

        let [metadataCID, imageCID] =
            await this.realEstateFactory.uploadAndMint(signer, realEstateUploadData);

        return [metadataCID, imageCID];
    }
}

export default RealEstateTokenFactoryFacade;