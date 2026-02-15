import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Heart, Share2, Info, Check, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Button } from '../../components/common/Button';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

import { useCart } from '../../context/CartContext';

export function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddedToast, setShowAddedToast] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // Fallback to mock data if it's one of the mock IDs
                    const MOCK_DATA = [
                        { id: '1', name: 'Serenity Blues', price: 299, image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200', category: 'Abstract', description: 'A calming exploration of depth and emotion through varying shades of azure and indigo.' },
                        { id: '2', name: 'Golden Horizon', price: 350, image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1200', category: 'Landscape', description: 'The warmth of a setting sun captured in vibrant oils on premium canvas.' }
                    ];
                    const mock = MOCK_DATA.find(p => p.id === id);
                    if (mock) setProduct(mock);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        setShowAddedToast(true);
        setTimeout(() => setShowAddedToast(false), 3000);
    };

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/cart');
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center flex-col gap-6 pt-20">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/products"><Button variant="secondary">Back to Collection</Button></Link>
    </div>;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-white">
            <div className="container mx-auto px-6">
                <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-400 font-medium mb-12 transition-colors">
                    <ArrowLeft size={20} /> Back to Gallery
                </Link>

                <div className="grid md:grid-cols-2 gap-16 items-start">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-2xl">
                            <img
                                src={getOptimizedImageUrl(product.image, 1200)}
                                alt={product.name}
                                className="w-full h-full object-contain p-8"
                            />
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="py-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-primary-50 text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider">{product.category}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400 text-sm font-medium">Authentic Hand-painted</span>
                        </div>

                        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-10">
                            <p className="text-4xl font-bold text-primary-400">{product.price.toLocaleString()} DZD</p>
                            <div className="h-8 w-[1px] bg-slate-200" />
                            <div className="flex items-center gap-1 text-yellow-400">
                                {[...Array(5)].map((_, i) => <Check key={i} size={16} />)}
                                <span className="text-slate-400 text-sm font-medium ml-2">(12 reviews)</span>
                            </div>
                        </div>

                        <p className="text-lg text-slate-500 leading-relaxed mb-10">
                            {product.description || "Elevate your space with this stunning original masterpiece. Handcrafted with premium materials, this piece brings a unique personality and professional touch to any modern interior. Each painting comes with a certificate of authenticity."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Button
                                onClick={handleAddToCart}
                                variant="secondary"
                                size="lg"
                                className="flex-1 py-5 bg-slate-50 border-none hover:bg-slate-100 gap-3 text-sm"
                            >
                                <ShoppingCart size={20} /> Add to Cart
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                size="lg"
                                className="flex-1 py-5 shadow-xl shadow-primary-200 gap-3 text-sm"
                            >
                                <ShoppingBag size={20} /> Order Now
                            </Button>
                            <button className="p-5 border border-slate-200 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
                                <Heart size={24} />
                            </button>
                            <button className="p-5 border border-slate-200 rounded-full text-slate-500 hover:text-primary-400 hover:bg-primary-50 transition-all">
                                <Share2 size={24} />
                            </button>
                        </div>

                        <div className="space-y-6 pt-10 border-t border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl text-primary-400"><Info size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Materials & Care</h4>
                                    <p className="text-slate-500 text-sm mt-1">Giclée print on archival cotton canvas. Avoid direct sunlight. Clean with a dry microfiber cloth.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl text-green-500"><Check size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Shipping Info</h4>
                                    <p className="text-slate-500 text-sm mt-1">Premium protective packaging. Insured delivery within 5-7 business days worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showAddedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest">Added to Cart</p>
                            <p className="text-[10px] text-slate-400 font-bold italic">Continuer vos achats ou voir le panier</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
