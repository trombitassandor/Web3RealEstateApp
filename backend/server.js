import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import RealEstateTokenFactoryFacade from "./realEstateTokenFactoryFacade.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const realEstateTokenFactoryFacade = new RealEstateTokenFactoryFacade();

app.post("/upload-mint", async (req, res) => {
    try {
        const { id, image, name, description, attributes } = req.body;

        const result = await realEstateTokenFactoryFacade
            .uploadAndMint(id, image, name, description, attributes);

        res.json({ success: true, metadataCID: result[0], imageCID: result[1] });
    } catch (error) {
        console.error("Error in upload-mint:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 5001 // process.env.BACKEND_PORT;
console.log("PORT =", PORT);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
