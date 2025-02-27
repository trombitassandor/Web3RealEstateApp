//const API_URL = `http://localhost:${process.env.BACKEND_PORT}`;
const PORT = 5001;
const API_URL = `http://localhost:${PORT}`;

export async function uploadAndMint(account, id, image, name, description, attributes) {
    try {
        console.log("uploadAndMint PORT =", PORT);

        const formData = new FormData();
        formData.append('account', account);
        formData.append('id', id);
        formData.append('image', image);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('attributes', JSON.stringify(attributes));

        // Log form data to see what is inside
        console.log("RealEstateService.uploadAndMint parameters");
        for (let pair of formData.entries()) {
            // If the value is a File object, log its details
            if (pair[1] instanceof File) {
                console.log(pair[0] + ": File ->", pair[1].name, pair[1].size, "bytes");
            } else {
                console.log(pair[0] + ": ", pair[1]);
            }
        }

        const response = await fetch(`${API_URL}/upload-mint`, {
            method: "POST",
            body: formData
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
