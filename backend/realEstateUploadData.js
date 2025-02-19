class RealEstateUploadData {
    constructor(
        id,
        imageStream,
        name,
        address,
        description,
        attributes
    ) {
        this.id = id;
        this.imageStream = imageStream;
        this.name = name;
        this.address = address;
        this.description = description;
        this.attributes = attributes;
    }
}

export default RealEstateUploadData;