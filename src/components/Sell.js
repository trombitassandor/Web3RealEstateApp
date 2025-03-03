import { useState } from "react";
import Close from '../assets/close.svg';
import Popup from "./Popup";
import { usePopup } from '../PopupContext';

import EthersUtils from "../utils/EthersUtils";
//import RealEstateTokenFactoryFacade from "../utils/UploadAndMint/realEstateTokenFactoryFacade";
import PinataUploader from "../utils/PinataUploader";
//import { uploadAndMint } from "../utils/RealEstateService";
import { Buffer } from 'buffer';

const Sell = ({
    accountAddress,
    provider,
    realEstateContract,
    escrowContract,
    onClose }) => {
    console.log("seller account address =", accountAddress);
    console.log("provider =", provider);
    console.log("realEstateContract =", realEstateContract);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [attributes, setAttributes] = useState([
        { trait_type: "Purchase Price", value: "" },
        { trait_type: "Type of Residence", value: "" },
        { trait_type: "Bedrooms", value: "" },
        { trait_type: "Bathrooms", value: "" },
        { trait_type: "Square Metre", value: "" },
        { trait_type: "Year Built", value: "" },
    ]);
    const [errors, setErrors] = useState({});
    const [popupEnabled, setPopupEnabled] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const { showGlobalPopup } = usePopup();

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImage(file);
    };

    const handleAttributeChange = (index, field, value) => {
        const updatedAttributes = [...attributes];
        updatedAttributes[index][field] = value;
        setAttributes(updatedAttributes);
    };

    const addAttribute = () => {
        setAttributes([...attributes, { trait_type: "", value: "" }]);
    };

    const removeAttribute = (index) => {
        const updatedAttributes = attributes.filter((_, i) => i !== index);
        setAttributes(updatedAttributes);
    };

    const validateForm = () => {
        let formErrors = {};
        let isValid = true;

        // Check if required fields are filled
        if (!name) {
            formErrors.name = "Name is required.";
            isValid = false;
        }
        if (!address) {
            formErrors.address = "Address is required.";
            isValid = false;
        }
        if (!description) {
            formErrors.description = "Description is required.";
            isValid = false;
        }

        // Check attributes fields (trait_type and value)
        attributes.forEach((attr, index) => {
            if (!attr.trait_type) {
                formErrors[`attribute_${index}`] = "Attribute is required.";
                isValid = false;
            }
            if (!attr.value) {
                formErrors[`value_${index}`] = "Value is required.";
                isValid = false;
            }
        });

        setErrors(formErrors);
        return isValid;
    };

    const showPopupMessage = (message) => {
        setPopupMessage(message);
        setPopupEnabled(true);
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            showPopupMessage("Please fill all required fields.");
            return;
        }

        // const id = EthersUtils.getSlicedAccountAddress(accountAddress);

        // console.log("Start upload real estate");
        // console.log("realEstateUploadData =", accountAddress, id, image, name, description, attributes);

        try {
            // using backend
            // await uploadAndMint(accountAddress, id, image, name, description, attributes);
            await uploadAndMintRealEstate();
        }
        catch (error) {
            showGlobalPopup(error.message);
            return;
        }

        console.log("Finished upload real estate");

        onClose(); // Close popup after submission

        showGlobalPopup("Real Estate Sell Submit");
    };

    const uploadAndMintRealEstate = async () => {
        // const realEstateTokenFactory = RealEstateTokenFactoryFacade();

        const signer = await provider.getSigner();
        console.log("signer =", signer);

        const nextRealEstateTokenId = await realEstateContract.nextTokenId();
        const id =
            `${EthersUtils.getSlicedAccountAddress(accountAddress)}
            _${nextRealEstateTokenId}`;

        console.log("signer =", signer);

        console.log("upload and mint real estate START");
        console.log(`signer.address = ${signer.address}
            id = ${id}
            image = ${image}
            name = ${name}
            address = ${address}
            description = ${description}
            attributes = ${attributes}`);

        const pinataUploader = new PinataUploader();

        // Upload image
        let imageCID, imageURL = '';
        if (image) {
            const imageName = `${id}_image`;
            imageCID = await pinataUploader.uploadFile(image, imageName);
            imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
            console.log("imageCID = ", imageCID);
            console.log("imageURL = ", imageURL);
        }

        // Create metadata
        const metadata = {
            name: name,
            address: address,
            description: description,
            image: imageURL,
            attributes: attributes,
        };
        console.log("metadata = ", metadata);

        const metadataJson = JSON.stringify(metadata, null, 2);
        console.log("Metadata object: ", metadataJson);

        // Convert metadata to buffer and upload
        // const metadataBuffer = Buffer.from(metadataJson);
        // const metadataStream = streamifier.createReadStream(metadataBuffer);
        const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
        const metadataFileName = `${id}_metadata.json`;
        // const metadataCID = await pinataUploader
        //     .uploadFile(metadataStream, metadataFileName);
        const metadataCID = await pinataUploader
            .uploadFile(metadataBlob, metadataFileName);
        console.log('Metadata uploaded successfully. CID:', metadataCID);

        const tokenURL = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

        try {
            let tx = await realEstateContract.connect(signer).mint(tokenURL);
            await tx.wait();
        } catch (error) {
            console.error("Error realEstateContract mint:", error);
        }

        // const [metadataCID, imageCID] = 
        //     await realEstateTokenFactory.uploadAndMint(signer, 
        //         id, image, name, address, description, attributes);

        console.log("upload and mint real estate END");
        console.log(`metadataCID = ${metadataCID} \n imageCID = ${imageCID}`);
    };

    return (
        <div className="sell">
            <div className="sell__details">
                <h2 className="text-lg font-bold mb-4">Sell Real Estate</h2>

                {/* Name */}
                <div className="flex flex-col mb-3">
                    <label className="mb-1 font-semibold">
                        Name:
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full p-2 border rounded 
                            ${errors.name && "error-input"}`} />
                    {errors.name &&
                        <p className="error-text">{errors.name}</p>}
                </div>

                {/* Address */}
                <div className="flex flex-col mb-3">
                    <label className="mb-1 font-semibold">Address:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full p-2 border rounded 
                            ${errors.address && "error-input"}`}
                    />
                    {errors.address &&
                        <p className="error-text">{errors.address}</p>}
                </div>

                {/* Description */}
                <div className="flex flex-col mb-3">
                    <label className="mb-1 font-semibold">Description:</label>
                    <div className="mt-2"> {/* Added margin top to ensure textarea starts on a new line */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full p-2 border rounded h-20 
                            ${errors.description && "error-input"}`}
                        />
                        {errors.description &&
                            <p className="error-text">{errors.description}</p>}
                    </div>
                </div>

                {/* Image Upload */}
                <div className="flex flex-col mb-4">
                    <label className="mb-1 font-semibold">
                        Upload Image:
                    </label>
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        className="w-full p-2 border rounded" />
                </div>

                {/* Display Uploaded Image */}
                {image && (
                    <div className="mb-4" style={{ margin: '1rem' }}>
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Uploaded Real Estate"
                            className="mt-2 border rounded"
                            style={{
                                //display: 'flex',
                                maxWidth: '40vh',
                                maxHeight: '40vh',
                                objectFit: 'contain', // Ensures the aspect ratio is maintained
                                margin: '0 auto',  // Adds margin around the image
                            }}
                        />
                    </div>
                )}

                {/* Attributes Section */}
                <div className="attributes-section">
                    <h3 className="attributes-heading">Attributes</h3>
                    <div className="attributes-list">
                        {attributes.map((attr, index) => (
                            <div key={index} className="attribute-group">
                                <div>
                                    <input
                                        type="text"
                                        value={attr.trait_type}
                                        placeholder="Attribute"
                                        onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                                        className={`attribute-input ${errors[`attribute_${index}`] && "error-input"}`}
                                    />
                                    {errors[`attribute_${index}`] && (
                                        <p className="error-text"
                                            style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '2px' }}>
                                            {errors[`attribute_${index}`]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={attr.value}
                                        placeholder="Value"
                                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                        className={`attribute-input ${errors[`value_${index}`] && "error-input"}`}
                                    />
                                    {errors[`value_${index}`] && (
                                        <p className="error-text"
                                            style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '2px' }}>
                                            {errors[`value_${index}`]}
                                        </p>)}
                                </div>
                                <button
                                    onClick={() => removeAttribute(index)}
                                    className="remove-button"
                                >
                                    ✖
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={addAttribute}
                    className="add-attribute-btn"
                >
                    + Add Attribute
                </button>

                <div className="mt-4 flex flex-col gap-2">
                    <button onClick={handleSubmit} className="submit-button">
                        Submit
                    </button>
                </div>

                <button onClick={onClose} className="realEstate__close">
                    <img src={Close} alt="Close" />
                </button>


            </div>
            <Popup
                message={popupMessage}
                show={popupEnabled}
                onClose={() => setPopupEnabled(false)}
            />
        </div>
    );
};

export default Sell;
