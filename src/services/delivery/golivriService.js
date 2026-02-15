import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// Standardized Proxy Path (Resolved to root to avoid 404s on subpages)
const API_ENDPOINT = '/api/delivery/create';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Creates an order in the ProColis/Ecotrack system.
 */
export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.1] Attempting ProColis Connection...", "color: white; background: #059669; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = orderData.wilaya;
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;

        // Construct Shotgun Payload
        const params = new URLSearchParams();
        params.append('api_token', API_TOKEN);

        // Client Info
        params.append('nom_client', orderData.fullName);
        params.append('telephone', orderData.phone);
        params.append('adresse', `${orderData.address}, ${orderData.commune}`);

        // Region Info
        params.append('code_wilaya', wilayaCode);
        params.append('wilaya', wilayaName);
        params.append('commune', orderData.commune);

        // Order Info
        params.append('montant', Math.round(orderData.total)); // Ensure integer
        params.append('produit', orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '));
        params.append('reference', orderData.orderId || `HA-${Date.now()}`);

        // Service Flags
        params.append('type', '1'); // Standard Delivery
        params.append('stop_desk', '0'); // Home
        params.append('prepared_by', 'Ha-Design App');

        // Use absolute path from window origin to prevent 404 on /admin
        const fetchUrl = `${window.location.origin}${API_ENDPOINT}`;

        console.log("📤 Sending Payload to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params.toString()
        });

        const rawText = await response.text();
        console.log("📥 Raw Response:", rawText);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${rawText}`);
        }

        const result = JSON.parse(rawText);
        console.log("✅ Sync Result:", result);
        return result;

    } catch (error) {
        console.error("❌ Sync Failed:", error);
        return { success: false, error: error.message };
    }
}
