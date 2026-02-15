// GoLivri (Ecotrack/ProColis) Integration Service
// Using the proxy path to bypass CORS issues on deployment

const API_PROXY = '/procolis-api/api_create';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Creates an order in the delivery system.
 * @param {Object} orderData - Formatted order data.
 */
export async function createGoLivriOrder(orderData) {
    console.log("%c[Delivery Sync Attempt]", "color: white; background: #2563eb; padding: 4px; font-weight: bold;");

    try {
        const payload = new URLSearchParams();
        payload.append('api_token', API_TOKEN);
        payload.append('nom_client', orderData.fullName);
        payload.append('telephone', orderData.phone);
        payload.append('adresse', orderData.address);
        payload.append('code_wilaya', orderData.wilaya);
        payload.append('commune', orderData.commune);
        payload.append('montant', orderData.total);
        payload.append('produit', orderData.items.map(i => `${i.name} (x${i.quantity})`).join(', '));
        payload.append('type', '1'); // Livraison
        payload.append('stop_desk', '0'); // Home
        payload.append('reference', orderData.orderId || `ORDER-${Date.now()}`);

        const url = `${API_PROXY}?api_token=${API_TOKEN}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: payload.toString()
        });

        const result = await response.json();
        console.log("Delivery Sync Response:", result);
        return result;
    } catch (error) {
        console.error("Delivery Sync Error:", error);
        return { success: false, error: error.message };
    }
}
