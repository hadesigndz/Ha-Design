const API_URL = import.meta.env.VITE_GOLIVRI_API_URL || 'https://app.golivri.dz/api/v1/create/order';
const API_TOKEN = import.meta.env.VITE_GOLIVRI_TOKEN;

/**
 * Creates a delivery order in GoLivri (Ecotrack) system.
 * @param {object} orderData - The order details.
 * @returns {Promise<object>} - The API response.
 */
export async function createGoLivriOrder(orderData) {
    if (!API_TOKEN) {
        console.warn("GoLivri API Token not configured.");
        return null;
    }

    try {
        // Prepare payload according to Ecotrack standard
        const payload = {
            api_token: API_TOKEN,
            nom_client: orderData.fullName,
            telephone: orderData.phone,
            adresse: orderData.address,
            code_wilaya: orderData.wilaya, // Should be string code like "16"
            commune: orderData.commune,
            montant: orderData.total,
            remarque: `Order via App. Items: ${orderData.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
            produit: orderData.items.map(i => i.name).join(', '),
            type: 1, // 1 = Delivery
            stop_desk: 0 // 0 = Domicile (Home Delivery) as requested
        };

        // Some Ecotrack APIs use query params, some use JSON or FormData.
        // Assuming JSON body for modern integration.
        // If it fails, try FormData.

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GoLivri API Error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Failed to sync order with GoLivri:", error);
        // We don't block the user flow, just log the error.
        return { error: error.message };
    }
}
