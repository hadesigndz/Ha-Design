import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// Standardized Proxy Path
const API_ENDPOINT = '/api/delivery/create';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Creates an order in the ProColis/Ecotrack system.
 * @param {Object} orderData - Formatted order data.
 */
export async function createGoLivriOrder(orderData) {
    console.log("%c[Delivery Sync Attempt Started]", "color: white; background: #059669; padding: 4px; font-weight: bold; font-size: 12px;");

    try {
        // Resolve Wilaya Name from code if not provided
        const wilayaCode = orderData.wilaya;
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;

        const payload = new URLSearchParams();
        payload.append('api_token', API_TOKEN);

        // Use multiple naming conventions to ensure compatibility
        payload.append('nom_client', orderData.fullName);
        payload.append('client', orderData.fullName);

        payload.append('telephone', orderData.phone);
        payload.append('phone', orderData.phone);

        payload.append('adresse', orderData.address);
        payload.append('code_wilaya', wilayaCode);
        payload.append('wilaya', wilayaName);

        payload.append('commune', orderData.commune);

        payload.append('montant', orderData.total);
        payload.append('total', orderData.total);

        const productsStr = orderData.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        payload.append('produit', productsStr);

        payload.append('type', '1'); // Delivery
        payload.append('stop_desk', '0'); // Home Delivery
        payload.append('reference', orderData.orderId || `ORDER-${Date.now()}`);

        const url = `${window.location.origin}${API_ENDPOINT}?api_token=${API_TOKEN}`;

        console.log("Calling Proxied API:", url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: payload.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Delivery API Error Response:", errorText);
            return { success: false, error: `Server returned ${response.status}: ${errorText}` };
        }

        const result = await response.json();
        console.log("Delivery Sync Result:", result);
        return result;
    } catch (error) {
        console.error("FATAL: Delivery Sync Error:", error);
        return { success: false, error: error.message };
    }
}
