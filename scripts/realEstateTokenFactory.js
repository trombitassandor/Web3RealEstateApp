class RealEstateTokenFactory {
    constructor(realEstateStorageService, realEstateContract) {
        this.realEstateStorageService = realEstateStorageService;
        this.realEstateContract = realEstateContract;
    }

    async uploadAndMint(realEstateUploadData) {
        const nextTokenId =
            await this.realEstateContract.nextTokenId();

        realEstateUploadData.id += `_${nextTokenId}`;

        let [metadataCID, imageCID] =
            await this.realEstateStorageService
                .uploadFile(realEstateUploadData);

        this.realEstateContract.mint(metadataCID);

        return [metadataCID, imageCID];
    }
}

export default RealEstateTokenFactory;