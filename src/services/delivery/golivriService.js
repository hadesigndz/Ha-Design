import { ALGERIA_REGIONS } from '../../utils/algeriaData';

// GoLivri / ProColis (Ecotrack) Service v1.4.0
const API_PROXY_PREFIX = '/api-v1-sync';
const AUTH_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Standard Creation for GoLivri / ZR Express / ProColis
 */
export async function createGoLivriOrder(orderData) {
    console.log("%c[Sync v1.4.0] Clean Ecotrack Implementation", "color: white; background: #2563eb; padding: 4px; font-weight: bold;");

    try {
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = orderData.wilayaName || ALGERIA_REGIONS[wilayaCode]?.name || wilayaCode;
        const cleanAmount = Math.round(orderData.total);

        let cleanPhone = String(orderData.phone).replace(/\D/g, '');
        if (cleanPhone.length === 9) cleanPhone = '0' + cleanPhone;

        // The ProColis JSON Structure
        const payload = {
            // AUTH: Some systems look for 'token', some 'api_token'
            token: AUTH_TOKEN,
            api_token: AUTH_TOKEN,

            // CUSTOMER
            nom_client: orderData.fullName,
            telephone: cleanPhone,
            adresse: `${orderData.address}, ${orderData.commune}`,

            // REGION
            code_wilaya: wilayaCode,
            wilaya: wilayaName,
            commune: orderData.commune,

            // ORDER
            montant: cleanAmount,
            produit: orderData.items.map(i => `${i.name} x${i.quantity}`).join(', '),
            reference: orderData.orderId || `HA-${Date.now()}`,

            // DEFAULTS
            type: '1', // Livraison
            stop_desk: '0', // Domicile
            prepared_by: 'Ha-Design Store'
        };

        // Standard endpoint for ZR Express / ProColis SaaS
        const fetchUrl = `${window.location.origin}${API_PROXY_PREFIX}/add_colis?token=${AUTH_TOKEN}`;

        console.log("📤 POSTing to:", fetchUrl);

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // HEADERS: Many Ecotrack SaaS require 'token' header
                'token': AUTH_TOKEN,
                'api_token': AUTH_TOKEN,
                'api-token': AUTH_TOKEN
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log("📥 Raw API Response:", rawText);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${rawText}`);
        }

        const result = JSON.parse(rawText);
        console.log("✅ Sync Result:", result);
        return result;

    } catch (error) {
        console.error("❌ Sync Service Error:", error);
        return { success: false, error: error.message };
    }
}
