import fs from 'fs';
import pinataSDK from '@pinata/sdk';

class PinataStorageService {
    constructor(apiKey, apiSecret) {
        this.pinata = new pinataSDK(apiKey, apiSecret);
    }

    async uploadFileFromPath(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist at path: ${filePath}`);
        }
        const file = fs.createReadStream(filePath);
        const fileName = filePath.split('/').pop();
        const ipfsHash = this.uploadFile(file, fileName);
        return ipfsHash;
    }

    async uploadFile(file, fileName) {
        try {
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
            
            throw new Error(`Failed to upload file to Pinata: ${error.message}`);
        }
    }

    getUrl(cid) {
        return `https://gateway.pinata.cloud/ipfs/${cid}`;
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

    async unpinFile(cid) {
        try {
            if (typeof cid !== 'string') {
                throw new Error(`Invalid CID: ${cid}`);
            }
            console.log("unpinFile with cid=", cid);
            const result = await this.pinata.unpin([cid]);
            console.log(`File with CID ${cid} successfully unpinned`);
            return result;
        } catch (error) {
            console.error('Error unpinning file from Pinata:', error);
            throw new Error('Failed to unpin file from Pinata');
        }
    }

    // Fetch file content from Pinata using the CID
    async fetchFile(cid) {
        try {
            const url = this.getUrl(cid);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error fetching file from Pinata');
            }

            return response;
        } catch (error) {
            console.error('Error fetching file from Pinata:', error);
            throw new Error('Failed to fetch file from Pinata');
        }
    }

}

export default PinataStorageService;
