import { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { ALGERIA_REGIONS } from '../../utils/algeriaData';
import { getDeliveryPrice } from '../../utils/deliveryPrices';
import { Button } from '../../components/common/Button';
import { ShoppingBag, Trash2, MapPin, Truck, Home as HomeIcon, CheckCircle, Wallet, Info, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useLanguage } from '../../context/LanguageContext';

export function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1); // 1: Cart, 2: Checkout Form, 3: Success
    const [loading, setLoading] = useState(false);
    const { t, lang } = useLanguage();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        wilaya: '',
        commune: '',
        address: '',
        deliveryType: 'home',
    });
    const [trackingCode, setTrackingCode] = useState(null);

    const deliveryFee = useMemo(() => {
        return getDeliveryPrice(formData.wilaya);
    }, [formData.wilaya]);

    const finalTotal = cartTotal + deliveryFee;

    const handleOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                customer: formData,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                total: finalTotal,
                status: 'pending',
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "orders"), orderData);
            setStep(3);
            clearCart();
        } catch (error) {
            console.error("CRITICAL ERROR in handleOrder:", error);
            alert("Failed to place order. Details: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="pt-40 pb-20 text-center container mx-auto px-6">
                <div className="max-w-md mx-auto bg-white p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-primary-50">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-slate-800">{t('cart.orderPlaced')}</h2>

                    <p className="text-slate-500 mb-10 leading-relaxed">
                        {t('cart.thankYou')} <span className="text-slate-900 font-bold">{formData.phone}</span> {t('cart.confirmCall')} <span className="text-primary-400 font-bold">{t('cart.homeDelivery')}</span>.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 italic text-sm text-slate-600">
                        {t('cart.paymentMode')}: <strong>{t('cart.cod')}</strong>
                    </div>
                    <Link to="/"><Button className="w-full py-4 rounded-2xl">{t('cart.returnShowroom')}</Button></Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && step === 1) {
        return (
            <div className="pt-40 pb-20 text-center container mx-auto px-6">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingBag size={64} className="text-slate-200" />
                </div>
                <h2 className="text-3xl font-bold mb-4">{t('cart.emptyTitle')}</h2>
                <p className="text-slate-500 mb-10">{t('cart.emptyDesc')}</p>
                <Link to="/products"><Button variant="primary" size="lg" className="px-12">{t('cart.browseCollection')}</Button></Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-24 bg-slate-50/50 min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl w-full text-start">
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 sm:gap-10">
                    <div className="lg:col-span-2 w-full">
                        <form id="order-form" onSubmit={handleOrder} className="space-y-8">
                            <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 text-start">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3">
                                    <ShoppingBag className="text-primary-400 w-6 h-6 sm:w-8 sm:h-8" /> {t('navbar.cart')}
                                </h1>
                                <div className="space-y-8">
                                    {cart.map((item) => (
                                        <div key={item.id} className="group flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-3 sm:p-4 hover:bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] transition-all border border-slate-50 sm:border-transparent w-full">
                                            <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-50">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700" />
                                            </div>
                                            <div className="flex-grow text-center sm:text-start w-full sm:w-auto">
                                                <h3 className="font-bold text-lg sm:text-xl text-slate-800 mb-1 leading-tight">{item.name}</h3>
                                                <p className="text-slate-400 text-xs sm:text-sm mb-2">{t(`categories.${item.category.toLowerCase()}`)}</p>
                                                <p className="text-primary-400 font-black text-lg">{item.price.toLocaleString()} {t('common.dzd')}</p>
                                            </div>
                                            <div className="flex w-full sm:w-auto justify-between sm:justify-start items-center gap-4 sm:gap-6 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-50">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-50 text-slate-400 hover:text-primary-400 transition-colors">-</button>
                                                    <span className="w-6 text-center font-black">{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-50 text-slate-400 hover:text-primary-400 transition-colors">+</button>
                                                </div>
                                                <button type="button" onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={20} className="sm:w-[22px]" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 text-start">
                                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-400 flex items-center justify-center">
                                        <MapPin size={20} />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold">{t('cart.shippingDetails')}</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">{t('cart.fullName')}</label>
                                            <input
                                                type="text" required value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800 shadow-inner text-sm sm:text-base"
                                                placeholder={t('cart.fullName')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">{t('cart.phone')}</label>
                                            <input
                                                type="tel" required value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800 shadow-inner text-sm sm:text-base"
                                                placeholder="0X XX XX XX XX"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">{t('cart.wilaya')}</label>
                                            <select
                                                required value={formData.wilaya}
                                                onChange={e => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base"
                                            >
                                                <option value="">{t('cart.selectRegion')}</option>
                                                {Object.entries(ALGERIA_REGIONS).map(([code, data]) => (
                                                    <option key={code} value={code}>{code} - {data.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">{t('cart.commune')}</label>
                                            <select
                                                required value={formData.commune} disabled={!formData.wilaya}
                                                onChange={e => setFormData({ ...formData, commune: e.target.value })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                                            >
                                                <option value="">{t('cart.selectMunicipality')}</option>
                                                {formData.wilaya && ALGERIA_REGIONS[formData.wilaya].communes.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">{t('cart.address')}</label>
                                        <input
                                            type="text" required value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800 shadow-inner text-sm sm:text-base"
                                            placeholder={t('cart.address')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-primary-50 sticky top-32 overflow-hidden text-start">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/30 rounded-full blur-3xl -z-10" />
                            <h2 className="text-2xl font-bold mb-8 tracking-tight">{t('cart.orderSummary')}</h2>

                            <div className="space-y-6 mb-10 text-slate-600">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-medium">{t('cart.galleryTotal')}</span>
                                    <span className="font-bold text-slate-900 tracking-tight">{cartTotal.toLocaleString()} {t('common.dzd')}</span>
                                </div>

                                <div className="flex justify-between items-start animate-fade-in py-6 border-y border-slate-50">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{t('cart.deliveryFee')}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                            {t('cart.homeDelivery')}
                                        </span>
                                    </div>
                                    <span className="font-bold text-primary-400">+{deliveryFee.toLocaleString()} {t('common.dzd')}</span>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t('cart.totalToPay')}</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter mt-1">
                                            {finalTotal.toLocaleString()} <span className="text-xl font-bold">{t('common.dzd')}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="order-form"
                                disabled={loading}
                                className="w-full py-5 text-xl font-black shadow-2xl shadow-primary-200 rounded-[1.5rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform font-black uppercase tracking-widest"
                            >
                                {loading ? t('common.loading') : <><Wallet size={24} /> {t('common.orderNow')}</>}
                            </Button>

                            <div className="mt-8 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl text-[11px] text-slate-500 border border-slate-100 leading-relaxed">
                                <ShieldCheck size={20} className="text-primary-400 shrink-0" />
                                <span>{t('cart.paymentNotice')} <strong>{t('cart.cod')}</strong> {t('cart.uponReceipt')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


