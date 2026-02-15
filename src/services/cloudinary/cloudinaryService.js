export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Ha-Design");

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dovec01qu/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

export const getOptimizedImageUrl = (url, width = 800) => {
    if (!url) return "";
    // Simple Cloudinary optimization string insertion if it's a cloudinary URL
    if (url.includes("cloudinary.com")) {
        const parts = url.split("/upload/");
        return `${parts[0]}/upload/c_scale,w_${width},q_auto,f_auto/${parts[1]}`;
    }
    return url;
};
