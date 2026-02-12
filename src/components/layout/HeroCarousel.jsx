import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    { id: 1, image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2000', title: 'Modern Abstracts', sub: 'Elevate your living space with unique textures' },
    { id: 2, image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2000', title: 'Golden Horizons', sub: 'The warmth of nature in every brushstroke' },
    { id: 3, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2000', title: 'Floral Elegance', sub: 'Bring the garden inside your home' },
    { id: 4, image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2000', title: 'Urban Flux', sub: 'Contemporary energy for your office' },
    { id: 5, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000', title: 'Natural Serenity', sub: 'Find peace in detailed landscapes' }
];

export function HeroCarousel() {
    const [index, setIndex] = useState(0);

    const next = useCallback(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prev = () => {
        setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <div className="relative h-[80vh] md:h-[85vh] w-full overflow-hidden bg-slate-900">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <img
                        src={SLIDES[index].image}
                        alt={SLIDES[index].title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/60 md:via-black/20" />
                </motion.div>
            </AnimatePresence>

            <div className="container mx-auto px-6 relative h-full flex items-center">
                <div className="max-w-2xl text-white">
                    <motion.div
                        key={`content-${index}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[1.1] md:leading-tight">
                            {SLIDES[index].title.split(' ')[0]} <br className="hidden sm:block" />
                            <span className="text-primary-300">{SLIDES[index].title.split(' ')[1]}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg leading-relaxed font-medium">
                            {SLIDES[index].sub}
                        </p>
                        <div className="flex gap-4">
                            <button className="px-10 py-5 bg-primary-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-500 transition-all shadow-2xl shadow-primary-400/40">
                                Explore Collection
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            <div className="hidden md:flex absolute bottom-12 right-12 gap-4">
                <button onClick={prev} className="p-5 rounded-2xl border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={next} className="p-5 rounded-2xl border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all">
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex gap-3">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 transition-all rounded-full ${i === index ? 'w-12 bg-primary-400' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
}
