import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FIXED PROXY PATH v1.2.4 - Switching to JSON payload based on ProColis 415 error feedback
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.4] Switching to JSON Payload Mode...", "color: white; background: #06b6d4; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = orderData.wilaya;
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        // JSON Payload based on server expectation for 'application/json'
        const payload = {
            api_token: API_TOKEN,
            nom_client: orderData.fullName,
            telephone: orderData.phone,
            adresse: `${orderData.address}, ${orderData.commune}`,
            code_wilaya: wilayaCode,
            wilaya: wilayaName,
            commune: orderData.commune,
            montant: cleanAmount,
            produit: orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '),
            reference: orderData.orderId || `HA-${Date.now()}`,
            type: '1',
            stop_desk: '0',
            prepared_by: 'Ha-Design App'
        };

        // Use absolute path from window origin to prevent 404 on /admin
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis`;

        console.log("📤 POSTing JSON to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log("📥 Raw API Output:", rawText);

        if (!response.ok) {
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
