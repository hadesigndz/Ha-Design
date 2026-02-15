// Use relative path which will be proxied by Vite (dev) or Netlify (prod)
const API_URL = '/api/ecotrack/api_create';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Creates a delivery order in GoLivri (Ecotrack) system.
 * @param {object} orderData - The order details.
 * @returns {Promise<object>} - The API response containing tracking info.
 */
export async function createGoLivriOrder(orderData) {
    if (!API_TOKEN) {
        console.warn("GoLivri API Token not configured.");
        return null;
    }

    try {
        console.log("Syncing order with GoLivri via Proxy:", API_URL);

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

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Ecotrack sometimes returns 200 even on error with success: false in body
        // Or 422 for validation errors.
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GoLivri API Error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log("GoLivri Order Created:", result);
        return result;
    } catch (error) {
        console.error("Failed to sync order with GoLivri:", error);
        // Return null/error object so UI knows it failed but doesn't crash
        return { error: error.message };
    }
}
