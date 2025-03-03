class RealEstateTokenFactory {
    constructor(realEstateStorageService, realEstateContract) {
        this.realEstateStorageService = realEstateStorageService;
        this.realEstateContract = realEstateContract;
    }

    async uploadAndMint(signer, realEstateUploadData) {
        const nextTokenId =
            await this.realEstateContract.nextTokenId();

        realEstateUploadData.id += `_${nextTokenId}`;

        const [metadataCID, imageCID] =
            await this.realEstateStorageService
                .uploadFile(realEstateUploadData);

        const tx = this.realEstateContract.connect(signer).mint(metadataCID);
        await tx.wait();

        return [metadataCID, imageCID];
    }
}

module.exports = RealEstateTokenFactory;