import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ShoppingBag, Heart, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { db } from '../../services/firebase/config';
import { useProducts } from '../../hooks/useProducts';
import { useLanguage } from '../../context/LanguageContext';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function ProductList() {
    const { products, loading: productsLoading } = useProducts();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();

    const handleBuy = (product) => {
        addToCart(product);
        navigate('/cart');
    };

    const categories = [
        { id: 'All', name: t('categories.all') },
        { id: 'Modern', name: t('categories.modern') },
        { id: 'Classic', name: t('categories.classic') },
        { id: 'Abstract', name: t('categories.abstract') },
        { id: 'Islamic', name: t('categories.islamic') },
        { id: 'Landscape', name: t('categories.landscape') },
        { id: 'Minimalist', name: t('categories.minimalist') },
        { id: 'Floral', name: t('categories.floral') },
    ];

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

    if (productsLoading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">{t('common.loading')}</div>;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-50/50 text-start">
            <div className="container mx-auto px-6">
                <header className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">{t('products.masterpieces')}</h1>
                    <p className="text-slate-500 text-lg">{t('products.fineArtDesc')}</p>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="flex gap-2 p-2 bg-white rounded-full shadow-sm border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilter(cat.id)}
                                className={`px-8 py-3 rounded-full text-sm font-black transition-all whitespace-nowrap tracking-tight ${filter === cat.id ? 'bg-primary-400 text-white shadow-xl shadow-primary-200' : 'text-slate-400 hover:text-primary-400'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className={`absolute ${lang === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
                        <input
                            type="text"
                            placeholder={t('products.searchPlaceholder')}
                            className={`w-full ${lang === 'ar' ? 'pr-14 pl-8' : 'pl-14 pr-8'} py-4 bg-white rounded-full border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-100 shadow-sm font-bold`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-10">
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product, i) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className="group relative bg-white rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(255,93,143,0.15)] transition-all duration-700 border border-slate-100/50"
                            >
                                <Link to={`/product/${product.id}`} className="block aspect-[1/1] overflow-hidden relative bg-slate-50">
                                    <img
                                        src={getOptimizedImageUrl(product.image, 600)}
                                        alt={product.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    {product.isPromo && (
                                        <div className="absolute top-6 right-6 z-20">
                                            <div className="bg-primary-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-200 animate-pulse">
                                                {t('common.sale')}
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-xl">
                                            {t(`categories.${product.category.toLowerCase()}`)}
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-4 sm:p-8">
                                    <div className="mb-3 sm:mb-6">
                                        <Link to={`/product/${product.id}`} className="block group/title">
                                            <h3 className="font-black text-base sm:text-xl text-slate-900 tracking-tight leading-tight group-hover/title:text-primary-400 transition-colors duration-300 line-clamp-1">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold mt-1 sm:mt-2 h-6 sm:h-8 line-clamp-2">
                                            {product.description || t('home.heroDesc')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mb-4 sm:mb-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 hidden sm:block">{t('products.investment')}</p>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <p className="font-black text-lg sm:text-2xl text-primary-400 tracking-tighter">
                                                    {product.price.toLocaleString()} <span className="text-[10px] sm:text-xs text-slate-400">{t('common.dzd')}</span>
                                                </p>
                                                {product.oldPrice && (
                                                    <p className="text-slate-300 line-through text-xs sm:text-sm font-bold tracking-tight">
                                                        {product.oldPrice.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 transition-all duration-300 shadow-xl shadow-slate-200"
                                        >
                                            <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleBuy(product)}
                                        className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-slate-50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-primary-50 hover:text-primary-400 hover:border-primary-100 transition-all duration-300"
                                    >
                                        {t('common.buyNow')}
                                    </button>
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
                        <h3 className="text-3xl font-black text-slate-300 tracking-tight italic">{t('common.noResults')}</h3>
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
                        <div className="text-start">
                            <p className="font-black text-xs uppercase tracking-widest">{t('products.addedToBag')}</p>
                            <p className="text-[10px] text-slate-400 font-bold italic">{t('products.keepExploring')}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


