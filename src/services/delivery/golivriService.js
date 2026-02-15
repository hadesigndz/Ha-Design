import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FIXED PROXY PATH v1.2.2
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.2] Universal Payload Mode...", "color: white; background: #6366f1; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = orderData.wilaya;
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        // SHOTGUN PAYLOAD (Supports ProColis, Ecotrack, and CourierDZ formats)
        const params = new URLSearchParams();
        params.append('api_token', API_TOKEN);

        // Client Variations
        params.append('nom_client', orderData.fullName);
        params.append('client', orderData.fullName);
        params.append('nom', orderData.fullName);

        // Phone Variations
        params.append('telephone', orderData.phone);
        params.append('telephone_1', orderData.phone);
        params.append('phone', orderData.phone);

        // Address & Geography
        params.append('adresse', `${orderData.address}, ${orderData.commune}`);
        params.append('code_wilaya', wilayaCode);
        params.append('wilaya', wilayaName);
        params.append('commune', orderData.commune);

        // Order Info
        params.append('montant', cleanAmount.toString());
        params.append('total', cleanAmount.toString());
        params.append('produit', orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '));
        params.append('reference', orderData.orderId || `HA-${Date.now()}`);

        // Settings
        params.append('type', '1'); // Delivery
        params.append('stop_desk', '0'); // Home
        params.append('nb_colis', '1');

        // FORCE ROOT PATH
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/api_create`;

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

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${rawText}`);

        const result = JSON.parse(rawText);
        console.log("✅ Sync Result:", result);
        return result;

    } catch (error) {
        console.error("❌ Sync Fatal:", error);
        return { success: false, error: error.message };
    }
}
