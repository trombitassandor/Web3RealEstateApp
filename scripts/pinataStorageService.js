import fs from 'fs';
import pinataSDK from '@pinata/sdk';

class PinataStorageService {
    constructor(apiKey, apiSecret) {
        this.pinata = new pinataSDK(apiKey, apiSecret);
    }

    async uploadFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File does not exist at path: ${filePath}`);
            }

            const file = fs.createReadStream(filePath);
            const fileName = filePath.split('/').pop();
            const options = {
                pinataMetadata: {
                    name: fileName,
                },
            };

            const result = await this.pinata.pinFileToIPFS(file, options);

            console.log('File uploaded successfully. CID:', result.IpfsHash);

            return result.IpfsHash;
        } catch (error) {

            console.error('Error uploading file to Pinata:', error);

            if (error.response) {
                console.error('Pinata response error:', error.response.data);
            }

            throw new Error('Failed to upload file to Pinata');
        }
    }

    async fetchFile(cid) {
        try {
            const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
            console.log('Fetching file from:', url);
            return url;
        } catch (error) {
            console.error('Error fetching file from Pinata:', error);
            throw new Error('Failed to fetch file from Pinata');
        }
    }

    async listPinnedFiles() {
        try {
            const result = await this.pinata.pinList();
            console.log('Pinned Files:', result);
            return result.rows;
        } catch (error) {
            console.error('Error listing pinned files on Pinata:', error);
            throw new Error('Failed to list pinned files');
        }
    }
}

export default PinataStorageService;
