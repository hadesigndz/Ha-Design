import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// STANDARDIZED PROXY PATH v1.2.8
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.8] Standard Ecotrack Mode...", "color: white; background: #059669; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        // Formatted Phone
        let cleanPhone = String(orderData.phone).replace(/\D/g, '');
        if (cleanPhone.length === 9) cleanPhone = '0' + cleanPhone;

        // CLEAN PAYLOAD (No Shotgun, just the essentials)
        const payload = {
            nom_client: orderData.fullName,
            telephone: cleanPhone,
            adresse: `${orderData.address}, ${orderData.commune}`,
            code_wilaya: wilayaCode,
            commune: orderData.commune,
            montant: cleanAmount,
            produit: orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '),
            reference: orderData.orderId || `HA-${Date.now()}`,
            type: '1',
            stop_desk: '0'
        };

        // URL AUTH (S2 layer usually looks here first)
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis?api_token=${API_TOKEN}`;

        console.log("📤 Sending Order to:", fetchUrl);

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
