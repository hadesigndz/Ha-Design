import { ALGERIA_REGIONS } from '../../utils/algeriaData';

/**
 * Golivri (Ecotrack) Delivery Service
 * Optimized for Algerian shipping standards and Ecotrack API v1 requirements.
 * 
 * Handling the "Clé non détectée S2" error by:
 * 1. Ensuring token is in both body and query parameters.
 * 2. Using strictly stringified values for all fields.
 * 3. Correctly mapping wilaya and commune names.
 */

const API_PROXY_PREFIX = '/api-v1-sync';
const AUTH_TOKEN = import.meta.env.VITE_GOLIVRI_TOKEN || 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Creates a delivery order in Golivri system.
 * 
 * @param {Object} orderData - The order details
 * @param {string} orderData.fullName - Customer full name
 * @param {string} orderData.phone - Customer phone number
 * @param {string} orderData.address - Customer shipping address
 * @param {string} orderData.wilaya - Wilaya code (e.g., "16")
 * @param {string} orderData.commune - Commune name or code
 * @param {number} orderData.total - Total amount to collect
 * @param {Array} orderData.items - List of products (id, name, quantity)
 * @param {string} [orderData.orderId] - Internal order reference
 * @returns {Promise<Object>} API response status and data
 */
export async function createGoLivriOrder(orderData) {
    console.log("%c[Delivery Service v2.1.0 - create/order]", "color: white; background: #2ecc71; padding: 4px; font-weight: bold;");
    console.group("%c Golivri Sync Process", "color: #fff; background: #e67e22; padding: 4px; border-radius: 4px;");

    try {
        // 1. Prepare and Validate Data
        const wilayaCode = String(orderData.wilaya).padStart(2, '0');
        const wilayaName = ALGERIA_REGIONS[wilayaCode]?.name || orderData.wilaya;
        const amount = Math.round(orderData.total);

        // Sanitize phone (ensure it starts with 0 and has 10 digits)
        let phone = String(orderData.phone).replace(/\D/g, '');
        if (phone.length === 9) phone = '0' + phone;
        if (phone.length > 10) phone = phone.slice(-10);

        // Format product string
        const productDescription = orderData.items
            .map(item => `${item.name} (x${item.quantity})`)
            .join(', ');

        // 2. Build Payload
        // Ecotrack is very picky about field names and types.
        const payload = {
            token: AUTH_TOKEN,
            api_token: AUTH_TOKEN, // Dual compatibility
            nom_client: orderData.fullName.trim(),
            telephone: phone,
            adresse: orderData.address.trim(),
            code_wilaya: wilayaCode,
            wilaya: wilayaName,
            commune: orderData.commune,
            montant: String(amount),
            produit: productDescription.substring(0, 255), // Limit length
            reference: orderData.orderId || `HA-${Date.now()}`,
            type: "1", // 1 for Home delivery, 2 for Stop Desk
            stop_desk: "0",
            prepared_by: "Ha-Design Store",
            note: orderData.note || ""
        };

        console.log("📦 Prepared Payload:", payload);

        // 3. Execute Request
        // Using the proxy defined in vite.config.js / netlify.toml
        // We append the token to the URL as well to prevent "Clé non détectée" errors
        const endpoint = `${window.location.origin}${API_PROXY_PREFIX}/create/order?token=${AUTH_TOKEN}`;

        console.log("🌐 Sending to:", endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log("📥 Raw Response:", responseText);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            // Some Ecotrack variants return plain text on success
            if (responseText.toLowerCase().includes('success')) {
                result = { status: 'success', message: responseText };
            } else {
                throw new Error(`Malformed JSON response: ${responseText}`);
            }
        }

        console.log("✅ Sync Result:", result);
        console.groupEnd();

        // Ecotrack creation response usually contains tracking as 'code_suivi' or 'tracking'
        const trackingCode = result.code_suivi || result.tracking || result.tracking_code || result.code;

        return {
            ...result,
            success: result.status === 'success' || result.success === true || result.code === 200 || !!trackingCode,
            trackingCode: trackingCode,
            message: result.message || (result.error ? result.error : 'Success')
        };

    } catch (error) {
        console.error("❌ Golivri Sync Error:", error);
        console.groupEnd();
        return {
            success: false,
            error: error.message
        };
    }
}
