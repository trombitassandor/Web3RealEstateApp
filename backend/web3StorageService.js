import { Web3Storage, getFilesFromPath } from 'web3.storage';

class Web3StorageService {
    constructor(token) {
        this.token = token;  // Your Web3.Storage API token
        this.storage = new Web3Storage({ token: this.token });
    }

    // Method to upload file(s) to Web3.Storage
    async uploadFile(filePath) {
        try {
            const files = await getFilesFromPath(filePath);
            console.log("Files prepared for upload:", files);

            const cid = await this.storage.put(files);
            console.log('File uploaded successfully. CID:', cid);

            return cid;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file to Web3.Storage');
        }
    }

    // Method to fetch file from Web3.Storage via CID
    async fetchFile(cid) {
        try {
            const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch file: ${res.statusText}`);
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            return url; // This is a URL pointing to the fetched file
        } catch (error) {
            console.error('Error fetching file:', error);
            throw new Error('Failed to fetch file from Web3.Storage');
        }
    }

    // Method to list all uploaded files (CIDs)
    async listUploadedFiles() {
        try {
            const uploads = await this.storage.list();
            return uploads;
        } catch (error) {
            console.error('Error listing uploaded files:', error);
            throw new Error('Failed to list uploaded files');
        }
    }
}

export default Web3StorageService;
