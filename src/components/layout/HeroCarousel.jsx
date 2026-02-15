import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    { id: 1, image: '/slides/slide1.jpg', title: 'Kids Collection', sub: 'Joyful art for your little ones' },
    { id: 2, image: '/slides/slide2.jpg', title: 'Urban Love', sub: 'Expressive colors for modern homes' },
    { id: 3, image: '/slides/slide3.jpg', title: 'Artistic Fusion', sub: 'A blend of nature and music' },
    { id: 4, image: '/slides/slide4.jpg', title: 'Islamic Art', sub: 'Sacred calligraphy for peaceful interiors' },
    { id: 5, image: '/slides/slide5.jpg', title: 'Pink Romance', sub: 'Soft floral aesthetics for elegant spaces' },
    { id: 6, image: '/slides/slide6.jpg', title: 'Algerian Heritage', sub: 'Iconic landmarks with a modern touch' },
    { id: 7, image: '/slides/slide7.jpg', title: 'Home Aesthetic', sub: 'Cozy and welcoming decorative pieces' }
];

export function HeroCarousel() {
    const [index, setIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState(new Set([0])); // Only preload first slide
    const timerRef = useRef(null);

    const next = useCallback(() => {
        setIndex((prev) => {
            const nextIdx = (prev + 1) % SLIDES.length;
            // Preload the next image and the one after
            setLoadedImages(loaded => {
                const newSet = new Set(loaded);
                newSet.add(nextIdx);
                newSet.add((nextIdx + 1) % SLIDES.length);
                return newSet;
            });
            return nextIdx;
        });
    }, []);

    const prev = () => {
        setIndex((prev) => {
            const prevIdx = (prev - 1 + SLIDES.length) % SLIDES.length;
            setLoadedImages(loaded => {
                const newSet = new Set(loaded);
                newSet.add(prevIdx);
                return newSet;
            });
            return prevIdx;
        });
    };

    const goTo = (i) => {
        setLoadedImages(loaded => {
            const newSet = new Set(loaded);
            newSet.add(i);
            newSet.add((i + 1) % SLIDES.length);
            return newSet;
        });
        setIndex(i);
    };

    // Preload adjacent slides after initial render
    useEffect(() => {
        const preloadTimer = setTimeout(() => {
            setLoadedImages(loaded => {
                const newSet = new Set(loaded);
                newSet.add(1); // Preload second slide
                return newSet;
            });
        }, 2000); // Start preloading 2s after mount
        return () => clearTimeout(preloadTimer);
    }, []);

    useEffect(() => {
        timerRef.current = setInterval(next, 5000);
        return () => clearInterval(timerRef.current);
    }, [next]);

    return (
        <div className="relative w-full overflow-hidden bg-slate-900 min-h-[85vh] md:min-h-0 md:aspect-video md:max-h-[80vh]">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                >
                    {loadedImages.has(index) ? (
                        <img
                            src={SLIDES[index].image}
                            alt={SLIDES[index].title}
                            className="w-full h-full object-cover object-center"
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={index === 0 ? "high" : "low"}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/60 md:via-black/20" />
                </motion.div>
            </AnimatePresence>

            <div className="container mx-auto px-6 relative h-full flex items-center pt-24 pb-24 md:pt-0 md:pb-0">
                <div className="max-w-2xl text-white">
                    <motion.div
                        key={`content-${index}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h1 className="text-3xl sm:text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter leading-[1.1] md:leading-tight">
                            {SLIDES[index].title.split(' ')[0]} <br className="hidden sm:block" />
                            <span className="text-primary-300">{SLIDES[index].title.split(' ')[1]}</span>
                        </h1>
                        <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium">
                            {SLIDES[index].sub}
                        </p>
                        <div className="flex gap-4 mb-16 md:mb-0">
                            <button className="px-6 py-3 sm:px-10 sm:py-5 bg-primary-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-500 transition-all shadow-2xl shadow-primary-400/40">
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
            <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex gap-2 sm:gap-3">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-1.5 transition-all rounded-full ${i === index ? 'w-12 bg-primary-400' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>

            {/* Hidden preload for adjacent slides */}
            <div className="hidden">
                {[...loadedImages].filter(i => i !== index).map(i => (
                    <link key={i} rel="preload" as="image" href={SLIDES[i].image} />
                ))}
            </div>
        </div>
    );
}
