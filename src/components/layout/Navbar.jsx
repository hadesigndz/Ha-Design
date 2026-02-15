import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useCart } from '../../context/CartContext';
import { AnimatePresence, motion } from 'framer-motion';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { cartCount } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Collections', path: '/products' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-2xl font-black tracking-tighter transition-colors flex items-center gap-3 text-primary-400"
                    >
                        <img
                            src="/logo.png"
                            alt="Ha-Design"
                            className="w-14 h-14 object-contain transition-all"
                            style={{ mixBlendMode: 'multiply' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <span>Ha-Design</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-black uppercase tracking-widest transition-all relative group ${location.pathname === link.path
                                    ? 'text-primary-400'
                                    : 'text-slate-900 hover:text-primary-400'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-2 left-0 w-0 h-[3px] rounded-full bg-primary-400 transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`} />
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/admin" className="transition-all hover:text-primary-400 text-slate-900 hover:scale-110">
                            <User size={22} />
                        </Link>
                        <Link to="/cart" className="relative group p-2">
                            <ShoppingBag size={24} className="transition-all group-hover:text-primary-400 text-slate-900 group-hover:scale-110" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-400 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Link to="/cart" className="relative p-2 text-slate-900 group">
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-5 h-5 bg-primary-400 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            className="p-2 rounded-xl transition-all text-slate-900"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed inset-0 top-[72px] bg-white z-[60] flex flex-col p-8"
                    >
                        <div className="flex-grow space-y-8 mt-10">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        to={link.path}
                                        className="text-4xl font-black text-slate-900 flex items-center justify-between group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="group-hover:text-primary-400 transition-colors uppercase tracking-tighter">
                                            {link.name}
                                        </span>
                                        <div className="w-12 h-1 bg-slate-100 rounded-full group-hover:w-20 group-hover:bg-primary-300 transition-all duration-500" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-10 border-t border-slate-50">
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full py-5 bg-slate-50 text-slate-800 border-none hover:bg-slate-100 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs" variant="secondary">
                                    <User size={20} /> Management Portal
                                </Button>
                            </Link>
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Ha-Design Premium Art</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
