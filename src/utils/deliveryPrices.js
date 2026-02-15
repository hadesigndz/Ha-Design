// Single delivery price table (no company selection)
export const DELIVERY_PRICES = {
    zone0: { home: 400, desk: 200 },  // Alger
    zone1: { home: 500, desk: 300 },  // Center-West
    zone2: { home: 650, desk: 400 },  // Major North
    zone3: { home: 750, desk: 500 },  // Central Plateaus
    zone4: { home: 900, desk: 700 },  // Near South
    zone5: { home: 1100, desk: 850 }, // Far South
};

export const WILAYA_ZONES = {
    "16": "zone0", // Alger
    "09": "zone1", "10": "zone1", "26": "zone1", "42": "zone1", "35": "zone1", // Blida, Bouira, Medea, Tipaza, Boumerdes
    "31": "zone2", "13": "zone2", "27": "zone2", "29": "zone2", "46": "zone2", "48": "zone2", // West
    "25": "zone2", "19": "zone2", "06": "zone2", "15": "zone2", "18": "zone2", "21": "zone2", "23": "zone2", // East
    "04": "zone2", "24": "zone2", "34": "zone2", "43": "zone2", // East/Center
    "17": "zone3", "07": "zone3", "28": "zone3", "14": "zone3", "05": "zone3", "12": "zone3", "39": "zone3", // Plateaus
    "01": "zone4", "02": "zone4", "03": "zone4", "08": "zone4", "20": "zone4", "22": "zone4", "32": "zone4", "38": "zone4", "40": "zone4", "41": "zone4", "44": "zone4", "45": "zone4", // Mixed
    "11": "zone5", "33": "zone5", "37": "zone5", "47": "zone5", "49": "zone5", "50": "zone5", "51": "zone5", "52": "zone5", "53": "zone5", "54": "zone5", "55": "zone5", "56": "zone5", "57": "zone5", "58": "zone5", // Saharien
    "59": "zone3", "60": "zone4", "61": "zone2", "62": "zone3", "63": "zone2", "64": "zone3", "65": "zone3", "66": "zone1", "67": "zone3", "68": "zone3", "69": "zone3" // New Wilayas mapping
};

export const getWilayaZone = (wilayaCode) => {
    return WILAYA_ZONES[wilayaCode] || "zone2";
};
