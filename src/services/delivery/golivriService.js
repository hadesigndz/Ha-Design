// Use relative path which will be proxied by Vite (dev) or Netlify (prod)
const API_URL = '/api/ecotrack/api_create';
const API_TOKEN = 'PcUfmcinux7pZGot0Ex6wJYPjWRk7EexgAXeSgqB4JXxJthGX9W2Sb1TEOa0';

/**
 * Creates a delivery order in GoLivri (Ecotrack/ProColis) system.
 * @param {object} orderData - The order details.
 * @returns {Promise<object>} - The API response containing tracking info.
 */
export async function createGoLivriOrder(orderData) {
    console.group("%c🚚 GOLIVRI/PROCOLIS SYNC", "background: #2563eb; color: white; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("Processing order for:", orderData.fullName);

    if (!API_TOKEN) {
        console.error("CRITICAL: GoLivri API Token not configured.");
        console.groupEnd();
        return null;
    }

    try {
        // Multi-format payload to support different Ecotrack/ProColis versions
        // Some use nom_client, some use client, some use wilaya vs code_wilaya
        const formData = new URLSearchParams();
        formData.append('api_token', API_TOKEN);

        // Names
        formData.append('nom_client', orderData.fullName);
        formData.append('client', orderData.fullName);
        formData.append('client_nom', orderData.fullName);

        // Contact
        formData.append('telephone', orderData.phone);
        formData.append('phone', orderData.phone);

        // Location (Using both Name and Code to be sure)
        formData.append('wilaya', orderData.wilayaName || orderData.wilaya);
        formData.append('code_wilaya', orderData.wilaya);
        formData.append('commune', orderData.commune);
        formData.append('adresse', orderData.address);

        // Amounts
        formData.append('montant', orderData.total);
        formData.append('total', orderData.total);

        // Product Details
        const productsStr = orderData.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        formData.append('produit', productsStr);
        formData.append('remarque', `Automatic order from web app. ${productsStr}`.substring(0, 255));

        // Logistics
        formData.append('type', '1'); // 1 = Livraison
        formData.append('stop_desk', '0'); // 0 = Domicile (Home Delivery)
        formData.append('reference', `REF-${Date.now()}`);
        formData.append('shop', 'Ha-Design');

        // Some APIs require the token in the query params even for POST
        const finalUrl = `${API_URL}?api_token=${API_TOKEN}`;

        console.log("Calling endpoint:", finalUrl);
        console.log("Transmitted Data (Form):", Object.fromEntries(formData));

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: formData.toString()
        });

        const rawText = await response.text();
        console.log("Raw API Response Text:", rawText);

        let result;
        try {
            result = JSON.parse(rawText);
        } catch (e) {
            console.warn("Response is not JSON. Using raw text as fallback.");
            result = { success: false, raw_response: rawText };
        }

        console.log("Parsed API Result:", result);
        console.groupEnd();
        return result;
    } catch (error) {
        console.error("FATAL ERROR in createGoLivriOrder:", error);
        console.groupEnd();
        return { error: error.message };
    }
}
