class PinataUploader {
    constructor() {
        this.apiKey = '007cc80ed8bdb18134b8';
        this.apiSecret = '21c4c0dcabcced58efbb4104b94d82b6826ce277308bd818529911260ff13534';
        this.jwt = btoa(`${this.apiKey}:${this.apiSecret}`);
        this.pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    }

    async uploadFile(file, fileName) {
        if (!file) {
            throw new Error("No file provided for upload.");
        }

        const formData = new FormData();
        formData.append("file", file);

        const metadata = JSON.stringify({
            name: fileName,
        });

        formData.append("pinataMetadata", metadata);

        try {
            const response = await fetch(this.pinataUrl, {
                method: "POST",
                headers: {
                    "pinata_api_key": this.apiKey,
                    "pinata_secret_api_key": this.apiSecret,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(`Failed to upload: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("File uploaded successfully! IPFS Hash:", result.IpfsHash);
            return result.IpfsHash;
        } catch (error) {
            console.error("Upload error:", error);
            throw new Error("Error uploading file to Pinata.");
        }
    }
}

export default PinataUploader;