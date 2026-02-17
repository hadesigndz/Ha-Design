import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FIXED v1.3.1 - Standard Ecotrack Bearer Authentication
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.3.1] Standard Ecotrack Bearer Mode", "color: white; background: #8b5cf6; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        let cleanPhone = String(orderData.phone).replace(/\D/g, '');
        if (cleanPhone.length === 9) cleanPhone = '0' + cleanPhone;

        const payload = {
            nom_client: orderData.fullName,
            telephone: cleanPhone,
            adresse: `${orderData.address}, ${orderData.commune}`,
            code_wilaya: wilayaCode,
            wilaya: wilayaName,
            commune: orderData.commune,
            montant: cleanAmount,
            produit: orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '),
            reference: orderData.orderId || `HA-${Date.now()}`,
            type: '1',
            stop_desk: '0'
        };

        // Standard ECOTRACK parcel creation endpoint
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis`;

        console.log("📤 POSTing to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // THE ECOTRACK STANDARD: Bearer Authentication
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log("📥 Raw API Output:", rawText);

        if (!response.ok) {
            // Check if it's still "Clé non détectée"
            if (rawText.includes("Clé non détectée") || rawText.includes("S2")) {
                console.warn("Bearer failed, attempting secondary header formats...");
                // Some Ecotrack systems expect 'api_token' in header
                const retryResponse = await fetch(fetchUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api_token': API_TOKEN,
                        'api-token': API_TOKEN
                    },
                    body: JSON.stringify(payload)
                });
                return await retryResponse.json();
            }
            throw new Error(`HTTP ${response.status}: ${rawText}`);
        }

        const result = JSON.parse(rawText);
        console.log("✅ Sync Result:", result);
        return result;

    } catch (error) {
        console.error("❌ Sync Fatal Error:", error);
        return { success: false, error: error.message };
    }
}
