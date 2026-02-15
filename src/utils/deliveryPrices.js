// Specific delivery prices per Wilaya (Home Delivery)
// Based on GoLivri Tarification provided by user.

export const WILAYA_PRICES = {
    "01": 1500, // Adrar
    "02": 850,  // Chlef
    "03": 950,  // Laghouat
    "04": 850,  // Oum El Bouaghi
    "05": 850,  // Batna
    "06": 850,  // Béjaïa
    "07": 900,  // Biskra
    "08": 1200, // Béchar
    "09": 700,  // Blida
    "10": 850,  // Bouira
    "11": 1800, // Tamanrasset
    "12": 900,  // Tébessa
    "13": 900,  // Tlemcen
    "14": 850,  // Tiaret
    "15": 800,  // Tizi Ouzou
    "16": 350,  // Alger
    "17": 950,  // Djelfa
    "18": 850,  // Jijel
    "19": 850,  // Sétif
    "20": 850,  // Saïda
    "21": 850,  // Skikda
    "22": 850,  // Sidi Bel Abbès
    "23": 850,  // Annaba
    "24": 900,  // Guelma
    "25": 800,  // Constantine
    "26": 800,  // Médéa
    "27": 850,  // Mostaganem
    "28": 900,  // M'Sila
    "29": 850,  // Mascara
    "30": 1000, // Ouargla
    "31": 850,  // Oran
    "32": 1050, // El Bayadh
    "33": 2100, // Illizi
    "34": 850,  // Bordj Bou Arreridj
    "35": 700,  // Boumerdès
    "36": 850,  // El Tarf
    "37": 1700, // Tindouf
    "38": 850,  // Tissemsilt
    "39": 1050, // El Oued
    "40": 850,  // Khenchela
    "41": 900,  // Souk Ahras
    "42": 700,  // Tipaza
    "43": 850,  // Mila
    "44": 850,  // Aïn Defla
    "45": 1200, // Naâma
    "46": 850,  // Aïn Témouchent
    "47": 950,  // Ghardaïa
    "48": 850,  // Relizane
    "49": 1600, // Timimoun
    "50": 1500, // Bordj Badji Mokhtar (Default high)
    "51": 950,  // Ouled Djellal
    "52": 1300, // Beni Abbes
    "53": 1900, // In Salah
    "54": 1900, // In Guezzam (Default high)
    "55": 1000, // Touggourt
    "56": 1200, // Djanet (Default high)
    "57": 1200, // El M'Ghair
    "58": 1100, // El Meniaa
};

// Helper: Get price, default to 850 if unknown/missing
export const getDeliveryPrice = (wilayaCode) => {
    if (!wilayaCode) return 0;
    return WILAYA_PRICES[wilayaCode] || 850;
};

// Legacy support if needed, but we should switch to direct price
export const DELIVERY_PRICES = WILAYA_PRICES; 
