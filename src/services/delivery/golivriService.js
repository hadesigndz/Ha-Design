import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FINAL v1.3.0 - GoLivri / ProColis Standard Implementation
const API_PROXY_PREFIX = '/api-v1-sync';
const API_KEY = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.3.0] GoLivri Standard Mode Enabled", "color: white; background: #2563eb; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        let cleanPhone = String(orderData.phone).replace(/\D/g, '');
        if (cleanPhone.length === 9) cleanPhone = '0' + cleanPhone;

        const payload = {
            api_token: API_KEY, // Body Token
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

        // Standard Ecotrack api_create endpoint
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/api_create`;

        console.log("📤 POSTing to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // THE SECRET: some Ecotrack S2 systems look for 'token' or 'api-token' in headers
                'token': API_KEY,
                'api-token': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log("📥 Raw API Output:", rawText);

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${rawText}`);

        const result = JSON.parse(rawText);
        console.log("✅ Sync Result:", result);
        return result;

    } catch (error) {
        console.error("❌ Sync Fatal Error:", error);
        return { success: false, error: error.message };
    }
}
