import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ShoppingBag, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';
import { HeroCarousel } from '../../components/layout/HeroCarousel';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../hooks/useProducts';

export function Home() {
    const { products } = useProducts(12);
    const [filter, setFilter] = useState('All');
    const [showAddedToast, setShowAddedToast] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (product) => {
        addToCart(product);
        setShowAddedToast(true);
        setTimeout(() => setShowAddedToast(false), 3000);
    };

    const handleBuyNow = (product) => {
        addToCart(product);
        navigate('/cart');
    };

    return (
        <div className="pt-0 overflow-x-hidden">
            <HeroCarousel />

            {/* Product Gallery Section */}
            <section className="py-24 bg-slate-50/50">
                <div className="container mx-auto px-6">
                    <header className="mb-20 text-center max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 px-6 py-2.5 bg-white rounded-full shadow-sm text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
                        >
                            <Sparkles size={16} />
                            <span>Premium Decoration</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Art That <span className="text-primary-400">Inspires</span></h2>
                        <p className="text-slate-500 text-lg font-medium">Elevate your living spaces with premium paintings and modern decoration solutions.</p>
                    </header>

                    {/* Quick Filters */}
                    <div className="flex justify-center gap-3 mb-16 overflow-x-auto no-scrollbar pb-4">
                        {['All', 'Abstract', 'Landscape', 'Minimalist', 'Floral'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat ? 'bg-primary-400 text-white shadow-xl shadow-primary-200' : 'bg-white text-slate-400 hover:text-primary-400 shadow-sm'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
                        {products
                            .filter(p => filter === 'All' || p.category === filter)
                            .map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.2) }}
                                    className="group bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-700 border border-slate-100"
                                >
                                    <div className="aspect-[4/5] overflow-hidden relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 sm:top-6 sm:left-6">
                                            <div className="bg-white/90 backdrop-blur-md px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                                                {product.category}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-8">
                                        <h3 className="font-black text-xs sm:text-xl text-slate-900 tracking-tight leading-tight mb-1 sm:mb-4 h-8 sm:h-14 line-clamp-2">{product.name}</h3>
                                        <p className="font-black text-primary-400 text-sm sm:text-2xl tracking-tighter mb-2 sm:mb-6">{product.price.toLocaleString()} DZD</p>

                                        <div className="grid grid-cols-2 gap-1.5 sm:gap-3 pt-2 sm:pt-4 border-t border-slate-50">
                                            <Button
                                                onClick={() => handleAddToCart(product)}
                                                variant="secondary"
                                                className="rounded-lg sm:rounded-xl py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest gap-1 sm:gap-2 bg-slate-50 border-none hover:bg-slate-100"
                                            >
                                                <ShoppingCart size={12} className="sm:w-[14px] sm:h-[14px]" /> Add
                                            </Button>
                                            <Button
                                                onClick={() => handleBuyNow(product)}
                                                className="rounded-lg sm:rounded-xl py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest gap-1 sm:gap-2 shadow-lg shadow-primary-100"
                                            >
                                                <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]" /> Buy
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/products">
                            <Button variant="secondary" className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-slate-100 hover:border-primary-400 bg-white shadow-sm">
                                View Full Collection <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

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
                            <p className="font-black text-xs uppercase tracking-widest">Added to Gallery Bag</p>
                            <p className="text-[10px] text-slate-400 font-bold italic">Keep exploring or check your cart</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
