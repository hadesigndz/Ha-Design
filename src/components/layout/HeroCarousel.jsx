import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SLIDE_COUNT = 7;

export function HeroCarousel() {
    const [index, setIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState(new Set([0])); // Only preload first slide
    const timerRef = useRef(null);
    const { t, lang } = useLanguage();

    const SLIDES = [
        { id: 1, image: '/slides/slide1.jpg', title: t('home.slides.1.title'), sub: t('home.slides.1.sub') },
        { id: 2, image: '/slides/slide2.jpg', title: t('home.slides.2.title'), sub: t('home.slides.2.sub') },
        { id: 3, image: '/slides/slide3.jpg', title: t('home.slides.3.title'), sub: t('home.slides.3.sub') },
        { id: 4, image: '/slides/slide4.jpg', title: t('home.slides.4.title'), sub: t('home.slides.4.sub') },
        { id: 5, image: '/slides/slide5.jpg', title: t('home.slides.5.title'), sub: t('home.slides.5.sub') },
        { id: 6, image: '/slides/slide6.jpg', title: t('home.slides.6.title'), sub: t('home.slides.6.sub') },
        { id: 7, image: '/slides/slide7.jpg', title: t('home.slides.7.title'), sub: t('home.slides.7.sub') }
    ];

    const next = useCallback(() => {
        setIndex((prev) => {
            const nextIdx = (prev + 1) % SLIDE_COUNT;
            setLoadedImages(loaded => {
                const newSet = new Set(loaded);
                newSet.add(nextIdx);
                newSet.add((nextIdx + 1) % SLIDE_COUNT);
                return newSet;
            });
            return nextIdx;
        });
    }, []);

    const prev = () => {
        setIndex((prev) => {
            const prevIdx = (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT;
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
            newSet.add((i + 1) % SLIDE_COUNT);
            return newSet;
        });
        setIndex(i);
    };

    useEffect(() => {
        const preloadTimer = setTimeout(() => {
            setLoadedImages(loaded => {
                const newSet = new Set(loaded);
                newSet.add(1);
                return newSet;
            });
        }, 2000);
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
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/60 md:via-black/20" />
                </motion.div>
            </AnimatePresence>

            <div className={`container mx-auto px-6 relative h-full flex items-center pt-24 pb-24 md:pt-0 md:pb-0 ${lang === 'ar' ? 'text-start' : 'text-start'}`}>
                <div className="max-w-2xl text-white">
                    <motion.div
                        key={`content-${index}`}
                        initial={{ opacity: 0, x: lang === 'ar' ? 30 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h1 className="text-3xl sm:text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter leading-[1.1] md:leading-tight">
                            {SLIDES[index].title.split(' ')[0]} <br className="hidden sm:block" />
                            <span className="text-primary-300">{SLIDES[index].title.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium">
                            {SLIDES[index].sub}
                        </p>
                        <div className="flex gap-4 mb-16 md:mb-0">
                            <button className="px-6 py-3 sm:px-10 sm:py-5 bg-primary-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-500 transition-all shadow-2xl shadow-primary-400/40">
                                {t('common.explore')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            <div className={`hidden md:flex absolute bottom-12 ${lang === 'ar' ? 'left-12' : 'right-12'} gap-4`}>
                <button onClick={prev} className="p-5 rounded-2xl border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all">
                    <ChevronLeft size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
                <button onClick={next} className="p-5 rounded-2xl border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all">
                    <ChevronRight size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
            </div>

            {/* Dots */}
            <div className={`absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 md:${lang === 'ar' ? 'right-12' : 'left-12'} md:translate-x-0 flex gap-2 sm:gap-3`}>
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-1.5 transition-all rounded-full ${i === index ? 'w-12 bg-primary-400' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
}

