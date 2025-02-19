//const API_URL = `http://localhost:${process.env.BACKEND_PORT}`;
const PORT = 5001;
const API_URL = `http://localhost:${PORT}`;

export async function uploadAndMint(id, image, name, description, attributes) {
    try {
        console.log("uploadAndMint PORT =", PORT);
        const response = await fetch(`${API_URL}/upload-mint`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, image, name, description, attributes })
        });

        if (!response.ok) {
            throw new Error(`Failed to upload and mint: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in uploadAndMint:", error);
        throw error;
    }
}
