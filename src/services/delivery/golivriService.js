import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// FIXED PROXY PATH v1.2.6 - Deep Shotgun JSON (Maximum field compatibility)
const API_PROXY_PREFIX = '/api-v1-sync';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.2.6] Deep Shotgun Mode (Max Compatibility)...", "color: white; background: #8b5cf6; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        // Ensure phone is exactly 10 digits
        let cleanPhone = orderData.phone.replace(/\D/g, '');
        if (cleanPhone.length === 9) cleanPhone = '0' + cleanPhone;

        const payload = {
            api_token: API_TOKEN,

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

            // Address Variations
            adresse: `${orderData.address}, ${orderData.commune}`,
            address: `${orderData.address}, ${orderData.commune}`,

            // Geography
            code_wilaya: wilayaCode,
            wilaya: wilayaName,
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
            type: '1',
            stop_desk: '0',
            prepared_by: 'Ha-Design App',
            nb_colis: 1
        };

        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis?api_token=${API_TOKEN}`;

        console.log("📤 POSTing Deep Shotgun JSON:", fetchUrl);

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
