const { expect } = require("chai");
const fs = require('fs');
const { default: PinataStorageService } = require('../backend/pinataStorageService');
const { default: RealEstateStorageService } = require('../backend/realEstateStorageService');
const { ethers } = require("hardhat");
const { default: EthersUtils } = require("../src/utils/EthersUtils");
const { default: RealEstateUtils } = require("../src/utils/RealEstateUtils");
const { default: RealEstateUploadData } = require("../backend/realEstateUploadData");
const { default: RealEstateTokenFactory } = require("../backend/realEstateTokenFactory");

describe("RealEstateStorageService", function () {
    const apiKey = '007cc80ed8bdb18134b8';
    const apiSecret = '21c4c0dcabcced58efbb4104b94d82b6826ce277308bd818529911260ff13534';
    const filePath = './metadata/realEstateImage00.webp';

    let pinataStorageService;
    let realEstateStorageService;
    let realEstateFactory;
    let metadataCID;
    let imageCID;
    let buyer, seller, inspector, lender;
    let realEstateContract;

    beforeEach(async () => {
        [buyer, seller, inspector, lender] = await ethers.getSigners();

        pinataStorageService = new PinataStorageService(apiKey, apiSecret);
        realEstateStorageService = new RealEstateStorageService(pinataStorageService);

        const RealEstate = await ethers.getContractFactory('RealEstate');
        realEstateContract = await RealEstate.deploy();

        realEstateFactory = new RealEstateTokenFactory(
            realEstateStorageService, realEstateContract);
    });

    it("should upload a file and return the metadata CID", async function () {
        const realEstateUploadData = new RealEstateUploadData(
            id = EthersUtils.getSlicedAccountAddress(realEstateContract.address),
            imageStream = fs.createReadStream(filePath),
            name = "Real Estate 00",
            address = "Address of Real Estate 00",
            description = "Real Estate 00 Description",
            attributes = [
                { trait_type: "Purchase Price", value: "$112,000" },
                { trait_type: "Type of Residence", value: "Apartments" },
                { trait_type: "Bedrooms", value: "1" },
                { trait_type: "Bathrooms", value: "1" },
                { trait_type: "Square Metre", value: "60 m²" },
                { trait_type: "Year Built", value: "2024" },
            ]
        );

        [metadataCID, imageCID] = await realEstateFactory
            .uploadAndMint(seller, realEstateUploadData);

        expect(metadataCID).to.be.a('string');
        expect(metadataCID.length).to.be.greaterThan(0);
    });

    it("should fetch the metadata and associated image URL", async function () {
        const metadata = await realEstateStorageService.fetchFile(metadataCID);
        expect(metadata).to.have.property('name', 'Real Estate 00');
        expect(metadata).to.have.property('image').that.to.include(imageCID);
    });

    it("should unpin a metadata file successfully", async function () {
        const result = await pinataStorageService.unpinFile(metadataCID);
        expect(result).to.have.property('message')
            .that.equals('Successfully unpinned file');
    });

    it("should unpin a metadata image file successfully", async function () {
        const result = await pinataStorageService.unpinFile(imageCID);
        expect(result).to.have.property('message')
            .that.equals('Successfully unpinned file');
    });
});
