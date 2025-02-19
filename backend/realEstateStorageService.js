/*
RealEstate
├── RealEstate01.json
├── RealEstate01.jpg
├── RealEstate02.json
├── RealEstate02.jpg
└── ...
*/

import streamifier from 'streamifier';

class RealEstateStorageService {
    constructor(storageService) {
        // Injecting storageService, which could be Pinata or any other provider
        this.storageService = storageService;
    }

    /**
     * Upload image and metadata to storage service (e.g., Pinata).
     * @param {Buffer} imageStream - The image file stream to be uploaded.
     * @param {string} realEstateName - The name of the real estate.
     * @param {string} realEstateAddress - The address of the real estate.
     * @param {string} description - A description of the real estate.
     * @param {Array} attributes - An array of attributes for the real estate (e.g., price, bedrooms).
     * @returns {string} The CID of the uploaded metadata.
     */
    async uploadFile(realEstateUploadData) {
        try {
            const imageCID = null;

            // Upload image
            if (realEstateUploadData.image != null) {
                const imageName = `${realEstateUploadData.id}_image`;
                imageCID = await this.storageService
                    .uploadFile(realEstateUploadData.imageStream, imageName);
                console.log('Image uploaded successfully. CID:', imageCID);
            }

            const image = imageCID != null
                ? `https://gateway.pinata.cloud/ipfs/${imageCID}`
                : '';

            // Create metadata
            const metadata = {
                seller: realEstateUploadData.seller,
                name: realEstateUploadData.name,
                address: realEstateUploadData.address,
                description: realEstateUploadData.description,
                image: image,
                attributes: realEstateUploadData.attributes,
            };
            const metadataJson = JSON.stringify(metadata, null, 2);
            console.log("Metadata object: ", metadataJson);

            // Convert metadata to buffer and upload
            const metadataBuffer = Buffer.from(metadataJson);
            const metadataStream = streamifier.createReadStream(metadataBuffer);
            const metadataFileName = `${realEstateUploadData.id}_metadata.json`;
            const metadataCID = await this.storageService
                .uploadFile(metadataStream, metadataFileName);
            console.log('Metadata uploaded successfully. CID:', metadataCID);

            return [metadataCID, imageCID];
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }
    }

    /**
     * Fetch the metadata and associated image URL from the storage service.
     * @param {string} metadataCID - The CID of the metadata to fetch.
     * @returns {Object} The metadata and the associated image URL.
     */
    async fetchFile(metadataCID) {
        try {
            const metadata = await this.storageService.fetchFile(metadataCID);
            const metadataJson = await metadata.json();
            return metadataJson;
        } catch (error) {
            console.error('Error fetching file:', error);
            throw new Error('Failed to fetch file');
        }
    }
}

export default RealEstateStorageService;
