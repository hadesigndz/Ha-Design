import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ShoppingBag, Heart, Search, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { db } from '../../services/firebase/config';
import { useProducts } from '../../hooks/useProducts';

export function ProductList() {
    const { products, loading: productsLoading } = useProducts();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleBuy = (product) => {
        addToCart(product);
        navigate('/cart');
    };

    const categories = ['All', 'Abstract', 'Landscape', 'Minimalist', 'Floral'];
    const [showAddedToast, setShowAddedToast] = useState(false);

    const handleAddToCart = (product) => {
        addToCart(product);
        setShowAddedToast(true);
        setTimeout(() => setShowAddedToast(false), 3000);
    };

    const filteredProducts = products.filter(p =>
        (filter === 'All' || p.category === filter) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (productsLoading) return <div className="h-screen flex items-center justify-center">Loading Gallery...</div>;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-50/50">
            <div className="container mx-auto px-6">
                <header className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">Our Masterpieces</h1>
                    <p className="text-slate-500 text-lg">Fine art selected for modern interiors. Every piece is a unique expression of emotion and technique.</p>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="flex gap-2 p-2 bg-white rounded-full shadow-sm border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-8 py-3 rounded-full text-sm font-black transition-all whitespace-nowrap tracking-tight ${filter === cat ? 'bg-primary-400 text-white shadow-xl shadow-primary-200' : 'text-slate-400 hover:text-primary-400'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search paintings..."
                            className="w-full pl-14 pr-8 py-4 bg-white rounded-full border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-100 shadow-sm font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-10">
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group bg-white rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-700 border border-slate-50"
                            >
                                <div className="aspect-[3/4] overflow-hidden relative bg-slate-50">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-contain p-3 sm:p-6 group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 sm:top-6 sm:left-6 flex flex-col gap-1 sm:gap-2">
                                        {product.isPromo && (
                                            <div className="bg-red-500 text-white px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl border-2 border-white/20 animate-pulse">
                                                Promo
                                            </div>
                                        )}
                                        <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[7px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                                            {product.category}
                                        </div>
                                    </div>

                                    <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
                                        <button className="p-2 sm:p-4 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-sm text-slate-400 hover:text-red-500 transition-all hover:scale-110">
                                            <Heart size={16} className="sm:w-[22px] sm:h-[22px]" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 translate-y-32 group-hover:translate-y-0 transition-all duration-700 ease-out">
                                        <Button onClick={() => handleBuy(product)} className="w-full py-3 sm:py-5 gap-2 sm:gap-3 shadow-2xl shadow-primary-400/40 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm">
                                            <ShoppingBag size={16} className="sm:w-[20px] sm:h-[20px]" /> Order Now
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-10">
                                    <div className="flex justify-between items-start mb-1 sm:mb-4">
                                        <h3 className="font-black text-xs sm:text-2xl text-slate-900 tracking-tight leading-tight line-clamp-2">{product.name}</h3>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-4">
                                        <span className="font-black text-primary-400 text-sm sm:text-2xl tracking-tighter">{product.price.toLocaleString()} DZD</span>
                                        {product.oldPrice && (
                                            <span className="text-slate-400 text-[10px] sm:text-sm font-bold line-through decoration-red-400/50 decoration-2 italic">
                                                {product.oldPrice.toLocaleString()} DZD
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-4 mt-3 sm:mt-8">
                                        <Button
                                            onClick={() => handleAddToCart(product)}
                                            variant="secondary"
                                            className="w-full py-2 sm:py-4 rounded-lg sm:rounded-2xl font-black text-[8px] sm:text-xs uppercase tracking-widest gap-1 sm:gap-2 bg-slate-50 border-none hover:bg-slate-100"
                                        >
                                            <ShoppingCart size={12} className="sm:w-[16px] sm:h-[16px]" /> Add
                                        </Button>
                                        <Button
                                            onClick={() => handleBuy(product)}
                                            className="w-full py-2 sm:py-4 rounded-lg sm:rounded-2xl font-black text-[8px] sm:text-xs uppercase tracking-widest gap-1 sm:gap-2 shadow-xl shadow-primary-100"
                                        >
                                            <ShoppingBag size={12} className="sm:w-[16px] sm:h-[16px]" /> Order
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-32 flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Filter size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-300 tracking-tight italic">The collection is still growing...</h3>
                    </div>
                )}
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
                            <p className="font-black text-xs uppercase tracking-widest">Added to Bag</p>
                            <p className="text-[10px] text-slate-400 font-bold italic">Keep shopping or view cart</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
