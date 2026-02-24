import { Facebook, Instagram, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const { t, lang } = useLanguage();

    return (
        <footer className="bg-white border-t border-primary-100 pt-16 pb-8 text-start">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary-400 mb-6 block">
                            Ha-Design
                        </Link>
                        <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                            {t('footer.desc')}
                        </p>
                        <div className={`flex ${lang === 'ar' ? 'space-x-reverse space-x-5' : 'space-x-5'}`}>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
                                <Music2 size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-50 text-primary-400 rounded-full hover:bg-primary-400 hover:text-white transition-all duration-300">
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
                        <h4 className="font-semibold mb-6">{t('footer.quickLinks')}</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">{t('navbar.home')}</Link></li>
                            <li><Link to="/products" className="hover:text-primary-400 transition-colors">{t('navbar.collection')}</Link></li>
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors">{t('navbar.about')}</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">{t('navbar.contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">{t('footer.support')}</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link to="/shipping" className="hover:text-primary-400 transition-colors">{t('footer.shipping')}</Link></li>
                            <li><Link to="/returns" className="hover:text-primary-400 transition-colors">{t('footer.returns')}</Link></li>
                            <li><Link to="/faqs" className="hover:text-primary-400 transition-colors">{t('footer.faqs')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary-50 text-center text-sm text-slate-400">
                    <p>© {currentYear} Ha-Design. {t('footer.rights')} | <strong><a href="https://zedlink.netlify.app" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary-400 transition-colors">DEVELOPED BY ZED-LINK Solution</a></strong></p>
                </div>
            </div>
        </footer>
    );
}
