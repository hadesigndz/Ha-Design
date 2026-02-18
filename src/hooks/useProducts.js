import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../services/firebase/config';

const CACHE_KEY = 'ha_design_products_v1';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

export function useProducts(limitCount = null) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dynamic cache key based on limit
    const currentCacheKey = limitCount ? `${CACHE_KEY}_limit_${limitCount}` : `${CACHE_KEY}_all`;

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                // 1. Try to load from cache first for instant display
                const cachedData = localStorage.getItem(currentCacheKey);
                let cachedList = null;

                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        // If cache is fresh (less than 1 hour)
                        if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
                            cachedList = parsed.data;
                            if (isMounted) {
                                setProducts(cachedList); // Already limited/full in cache
                                setLoading(false);
                            }
                            return; // Stop here if cache is valid
                        }
                    } catch (e) {
                        console.error("Cache parse error", e);
                        localStorage.removeItem(currentCacheKey);
                    }
                }

                // 2. Fetch fresh data if cache is missing or stale
                // Sort by createdAt descending if possible, need index. For now just fetch.
                const productRef = collection(db, "products");
                // If limitCount provided, only fetch that many (plus a buffer for filtering if needed, but here simple limit)
                const q = limitCount
                    ? query(productRef, limit(limitCount))
                    : query(productRef);

                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 3. Update cache
                if (list.length > 0) {
                    localStorage.setItem(currentCacheKey, JSON.stringify({
                        data: list,
                        timestamp: Date.now()
                    }));
                }

                if (isMounted) {
                    setProducts(list);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                if (isMounted) setError(err);

                // 4. Fallback to stale cache if network fails
                const cachedData = localStorage.getItem(currentCacheKey);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (isMounted) {
                        setProducts(parsed.data);
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
