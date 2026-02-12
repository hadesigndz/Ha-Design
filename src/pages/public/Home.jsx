import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '../../components/layout/HeroCarousel';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

export function Home() {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const q = query(collection(db, "products"), limit(3));
                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFeatured(list);
            } catch (error) {
                console.error("Error fetching featured products:", error);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="pt-0 overflow-x-hidden">
            <HeroCarousel />

            {/* Intro section */}
            <section className="py-20 md:py-32 bg-[#fef2f2]">
                <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white rounded-full shadow-sm text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                            <Sparkles size={16} />
                            <span>Premium Decoration</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-8">
                            Art That <span className="text-primary-400">Inspires</span> <br className="hidden md:block" /> Your Space
                        </h2>
                        <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg font-medium">
                            Discover a curated collection of modern paintings and artisanal decorations designed to elevate your home aesthetics.
                        </p>
                        <Link to="/products">
                            <Button size="lg" className="px-12 py-6 text-lg font-black gap-3 shadow-2xl shadow-primary-200 rounded-2xl uppercase tracking-widest text-sm">
                                Explore The Gallery <ArrowRight size={22} />
                            </Button>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                        {featured.length > 0 ? (
                            featured.slice(0, 2).map((prod, i) => (
                                <motion.div
                                    key={prod.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.2 }}
                                    className={`group rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-slate-50 ${i === 1 ? 'sm:mt-16' : ''}`}
                                >
                                    <div className="h-72 lg:h-80 overflow-hidden">
                                        <img src={prod.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                    <div className="p-10">
                                        <h4 className="font-black text-2xl mb-2 tracking-tight">{prod.name}</h4>
                                        <p className="text-primary-400 font-black text-xl italic">{prod.price.toLocaleString()} DZD</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Fallback Skeleton
                            [1, 2].map((i) => (
                                <div key={i} className={`h-96 rounded-[3rem] bg-white border border-slate-100 shadow-xl flex items-center justify-center p-12 text-center text-slate-200 italic font-black ${i === 2 ? 'sm:mt-16' : ''}`}>
                                    Artist's Canvas Waiting...
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Curated Collections</h2>
                    <p className="text-slate-500 mb-20 max-w-2xl mx-auto text-xl font-medium leading-relaxed">Explore our diverse styles from minimal abstracts to vibrant impressionism.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { name: 'Abstract', img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800' },
                            { name: 'Landscape', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800' },
                            { name: 'Minimalist', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800' }
                        ].map((category, idx) => (
                            <motion.div
                                key={category.name}
                                whileHover={{ y: -15 }}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="group relative h-[30rem] rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-50"
                            >
                                <img
                                    src={category.img}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-12 text-left">
                                    <h3 className="text-white text-4xl font-black mb-4 tracking-tighter capitalize">{category.name}</h3>
                                    <Link to="/products" className="text-white/80 hover:text-white flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] transition-all">
                                        View Collection <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
