class RealEstateUtils {
    static getName(realEstate) {
        return realEstate.name;
    }

    static getImage(realEstate) {
        return realEstate.image;
    }

    static getAddress(realEstate) {
        return realEstate.address;
    }

    static getAttributes(realEstate) {
        return realEstate.attributes;
    }

    static getTraitType(attribute) {
        return attribute.trait_type;
    }

    static getValue(attribute) {
        return attribute.value;
    }

    static getDescription(realEstate) {
        return realEstate.description;
    }

    static getPurchasePrice(realEstate) {
        return this.findAttributeValue(realEstate, 'Purchase Price');
    }

    static getBedrooms(realEstate) {
        return this.findAttributeValue(realEstate, 'Bedrooms');
    }

    static getBathrooms(realEstate) {
        return this.findAttributeValue(realEstate, 'Bathrooms');
    }

    static getSquareMetre(realEstate) {
        return this.findAttributeValue(realEstate, 'Square Metre');
    }

    static getYearBuilt(realEstate) {
        return this.findAttributeValue(realEstate, 'Year Built');
    }

    static findAttributeValue(metadata, attributeType) {
        let attribute = metadata.attributes.find(attr =>
            attr.trait_type === attributeType)
        return attribute?.value;
    }
}

export default RealEstateUtils;