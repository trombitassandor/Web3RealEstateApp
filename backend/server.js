const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { Readable } = require('stream');
const RealEstateTokenFactoryFacade = require('./realEstateTokenFactoryFacade.js');
dotenv.config();

const app = express();
app.use(cors());

// Set up multer for handling file uploads (in memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const realEstateTokenFactoryFacade = new RealEstateTokenFactoryFacade();

// The updated route to handle file uploads
app.post("/upload-mint", upload.single('image'), async (req, res) => {
    try {
        // Log received message
        console.log("Received data:", req.body);
        console.log("Received file:", req.file);

        // Extract form data and file from the request
        const { account, id, name, address, description, attributes } = req.body;
        const imageStream = req.file != null 
            ? Readable.from(req.file.buffer)
            : null;

        // Call uploadAndMint function with the image buffer
        const [metadataCID, imageCID] = await realEstateTokenFactoryFacade
            .uploadAndMint(account, id, imageStream, name, address, description, attributes);

        // Respond with metadataCID and imageCID
        res.json({ success: true, metadataCID, imageCID });
    } catch (error) {
        console.error("Error in upload-mint:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 5001;
console.log("PORT =", PORT);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
