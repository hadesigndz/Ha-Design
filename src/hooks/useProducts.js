import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase/config';

const CACHE_KEY = 'ha_design_products_v1';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

export function useProducts(limitCount = null) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                // 1. Try to load from cache first for instant display
                const cachedData = localStorage.getItem(CACHE_KEY);
                let cachedList = null;

                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        // If cache is fresh (less than 1 hour)
                        if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
                            cachedList = parsed.data;
                            if (isMounted) {
                                setProducts(limitCount ? cachedList.slice(0, limitCount) : cachedList);
                                setLoading(false);
                            }
                            return; // Stop here if cache is valid
                        }
                    } catch (e) {
                        console.error("Cache parse error", e);
                        localStorage.removeItem(CACHE_KEY);
                    }
                }

                // 2. Fetch fresh data if cache is missing or stale
                // Sort by createdAt descending if possible, need index. For now just fetch.
                const q = query(collection(db, "products"));
                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 3. Update cache
                if (list.length > 0) {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: list,
                        timestamp: Date.now()
                    }));
                }

                if (isMounted) {
                    setProducts(limitCount ? list.slice(0, limitCount) : list);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                if (isMounted) setError(err);

                // 4. Fallback to stale cache if network fails
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (isMounted) {
                        setProducts(limitCount ? parsed.data.slice(0, limitCount) : parsed.data);
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadProducts();

        return () => { isMounted = false; };
    }, [limitCount]);

    return { products, loading, error };
}
