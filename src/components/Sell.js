import { useState } from "react";
import close from '../assets/close.svg';

const Sell = ({ onClose }) => {
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

    const handleSubmit = () => {
        const realEstateData = {
            name,
            address,
            description,
            image: image ? image.name : "", // You will handle the URL creation separately
            attributes,
        };
        console.log("Generated JSON:", JSON.stringify(realEstateData, null, 2));
        onClose(); // Close popup after submission
    };

    return (
        <div className="sell">
            <div className="sell__details">
                <h2 className="text-lg font-bold mb-4">Sell Real Estate</h2>

                {/* Name */}
                <div className="flex flex-col mb-3">
                    <label className="mb-1 font-semibold">Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded" />
                </div>

                {/* Address */}
                <div className="flex flex-col mb-3">
                    <label className="mb-1 font-semibold">Address:</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2 border rounded" />
                </div>

                {/* Description */}
                <div className="flex flex-col mb-3">
                    <label className="mb-1 font-semibold">Description:</label>
                    <div className="mt-2"> {/* Added margin top to ensure textarea starts on a new line */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Image Upload */}
                <div className="flex flex-col mb-4">
                    <label className="mb-1 font-semibold">Upload Image:</label>
                    <input type="file" onChange={handleImageUpload} className="w-full p-2 border rounded" />
                </div>

                {/* Display Uploaded Image */}
                {image && (
                    <div className="mb-4" style={{ margin: '1rem' }}>
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Uploaded Real Estate"
                            className="mt-2 border rounded"
                            style={{
                                display: 'flex',
                                maxWidth: '25vh',
                                maxHeight: '25vh',
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
                                <input
                                    type="text"
                                    value={attr.trait_type}
                                    placeholder="Attribute"
                                    onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                                    className="attribute-input"
                                />
                                <input
                                    type="text"
                                    value={attr.value}
                                    placeholder="Value"
                                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                    className="attribute-input"
                                />
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

                {/* Submit & Close Buttons */}
                <div className="mt-4 flex flex-col gap-2">
                    <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Submit
                    </button>
                    <button onClick={onClose} className="realEstate__close">
                        <img src={close} alt="Close" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sell;
