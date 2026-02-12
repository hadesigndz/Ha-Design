import { Facebook, Instagram, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-primary-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary-400 mb-6 block">
                            Ha-Design
                        </Link>
                        <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                            Elevating your living spaces with premium paintings and modern decoration solutions.
                            Specialized in high-end artistic expressions for contemporary homes.
                        </p>
                        <div className="flex space-x-5">
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                <Music2 size={20} /> {/* TikTok icon often represented by Music note or similar in Lucide */}
                            </a>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                {/* Pinterest icon - standard Lucide doesn't have it, I'll use a generic pin or a custom SVG if needed, but Pinterest is common */}
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M8 20c.4 1.2 1.4 2 2.7 2 2.2 0 4-1.8 4-4 0-1.2-.5-2.2-1.3-3L12 12m0 0l-3-3m3 3l3-3m-3 3v8M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                            <li><Link to="/products" className="hover:text-primary-400 transition-colors">Drawings</Link></li>
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link to="/shipping" className="hover:text-primary-400 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/returns" className="hover:text-primary-400 transition-colors">Returns & Refunds</Link></li>
                            <li><Link to="/faqs" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary-50 text-center text-sm text-slate-400">
                    <p>© {currentYear} Ha-Design. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
