import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FIXED PROXY PATH v1.2.7 - Extreme Authentication Shotgun
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.7] Extreme Auth Mode (Key Shotgun)...", "color: white; background: #e11d48; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        // Ensure phone is exactly 10 digits
        let cleanPhone = String(orderData.phone).replace(/\D/g, '');
        if (cleanPhone.length === 9) cleanPhone = '0' + cleanPhone;

        // PAYLOAD SHOTGUN: We send the token under every possible name
        const payload = {
            // Token Variations (The likely culprits for "Clé non détectée")
            api_token: API_TOKEN,
            token: API_TOKEN,
            api_key: API_TOKEN,
            apiKey: API_TOKEN,
            key: API_TOKEN,
            cle: API_TOKEN,
            cle_api: API_TOKEN,

            // Client Name Variations
            nom_client: orderData.fullName,
            client: orderData.fullName,
            name: orderData.fullName,
            nom: orderData.fullName,

            // Phone Variations
            telephone: cleanPhone,
            phone: cleanPhone,
            tel: cleanPhone,
            telephone_1: cleanPhone,

            // Address & Geography
            adresse: `${orderData.address}, ${orderData.commune}`,
            address: `${orderData.address}, ${orderData.commune}`,
            code_wilaya: wilayaCode,
            wilaya: wilayaName,
            wilaya_id: parseInt(wilayaCode),
            commune: orderData.commune,
            city: orderData.commune,

            // Order details
            montant: cleanAmount,
            total: cleanAmount,
            price: cleanAmount,
            prix: cleanAmount,

            // Product
            produit: orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '),
            product: orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '),

            // Misc
            reference: orderData.orderId || `HA-${Date.now()}`,
            order_id: orderData.orderId || `HA-${Date.now()}`,
            type: '1',
            stop_desk: '0',
            stopdesk: '0',
            prepared_by: 'Ha-Design App',
            nb_colis: 1
        };

        // URL SHOTGUN: Put key in URL as well using different names
        const queryParams = new URLSearchParams({
            api_token: API_TOKEN,
            token: API_TOKEN,
            key: API_TOKEN
        }).toString();

        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis?${queryParams}`;

        console.log("📤 POSTing Shotgun JSON to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Header SHOTGUN: For APIs that look in headers
                'Authorization': `Bearer ${API_TOKEN}`,
                'X-API-KEY': API_TOKEN,
                'Token': API_TOKEN
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
