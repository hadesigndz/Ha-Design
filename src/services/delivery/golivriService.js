import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FIXED PROXY PATH v1.2.3 - Targeting 'add_colis' which is the standard Ecotrack endpoint
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.3] Testing 'add_colis' Endpoint...", "color: white; background: #fbbf24; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = orderData.wilaya;
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        // Standard Ecotrack (ProColis/ZR Express) Payload
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
        params.append('montant', cleanAmount.toString());
        params.append('produit', orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '));
        params.append('reference', orderData.orderId || `HA-${Date.now()}`);

        // Service Flags
        params.append('type', '1'); // Livraison
        params.append('stop_desk', '0'); // Home 
        params.append('prepared_by', 'Ha-Design App');

        // We try 'add_colis' instead of 'api_create'
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis`;

        console.log("📤 POSTing to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params.toString()
        });

        const rawText = await response.text();
        console.log("📥 Raw API Output:", rawText);

        if (!response.ok) {
            // If add_colis also fails with 404, we log it and try a fallback in the next version if needed
            throw new Error(`HTTP ${response.status}: ${rawText}`);
        }

        const result = JSON.parse(rawText);
        console.log("✅ Sync Result:", result);
        return result;

    } catch (error) {
        console.error("❌ Sync Fatal:", error);
        return { success: false, error: error.message };
    }
}
