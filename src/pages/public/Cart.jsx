import { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { ALGERIA_REGIONS } from '../../utils/algeriaData';
import { getDeliveryPrice } from '../../utils/deliveryPrices';
import { Button } from '../../components/common/Button';
import { ShoppingBag, Trash2, MapPin, Truck, Home as HomeIcon, CheckCircle, Wallet, Info, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { createGoLivriOrder } from '../../services/delivery/golivriService';

console.log("%c[Ha-Design App v1.4.0 - Clean Ecotrack Mode]", "color: white; background: #2563eb; padding: 4px; border-radius: 4px; font-weight: bold;");

export function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1); // 1: Cart, 2: Checkout Form, 3: Success
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        wilaya: '',
        commune: '',
        address: '',
        deliveryType: 'home', // Always home delivery
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
            console.log("1. Starting Order Submission Process...");
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

            // 1. Save to Firebase
            console.log("2. Saving to Firestore...");
            const orderRef = await addDoc(collection(db, "orders"), orderData);
            console.log("3. Firestore Saved. Order ID:", orderRef.id);

            // 2. Sync with GoLivri (Wait for tracking code)
            console.log("4. Syncing with Delivery Partner...");
            const wilayaName = ALGERIA_REGIONS[formData.wilaya]?.name || formData.wilaya;

            const deliveryResult = await createGoLivriOrder({
                fullName: formData.fullName,
                phone: formData.phone,
                wilaya: formData.wilaya,
                wilayaName: wilayaName,
                commune: formData.commune,
                address: formData.address,
                total: finalTotal,
                items: cart.map(item => ({ name: item.name, quantity: item.quantity })),
                source: window.location.origin
            });

            console.log("5. Delivery Sync Result:", deliveryResult);

            if (deliveryResult && (deliveryResult.code_suivi || deliveryResult.tracking_code || deliveryResult.code)) {
                const code = deliveryResult.code_suivi || deliveryResult.tracking_code || deliveryResult.code;
                console.log("6. Tracking Code Found:", code);
                setTrackingCode(code);
                // Update order with tracking code
                await updateDoc(orderRef, { deliveryTracking: code });
            } else {
                console.warn("No tracking code returned in API response.");
            }

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
                    <h2 className="text-3xl font-bold mb-4 text-slate-800">Order Placed!</h2>

                    {trackingCode && (
                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-6 mx-auto inline-block">
                            <span className="text-slate-500 text-sm block mb-1">Your Tracking Number</span>
                            <span className="text-2xl font-mono font-bold text-primary-600 tracking-wider">
                                {trackingCode}
                            </span>
                        </div>
                    )}

                    <p className="text-slate-500 mb-10 leading-relaxed">
                        Thank you for your order. We will call you at <span className="text-slate-900 font-bold">{formData.phone}</span> to confirm before shipping via <span className="text-primary-400 font-bold">Home Delivery</span>.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 italic text-sm text-slate-600">
                        Payment Mode: <strong>Cash on Delivery (COD)</strong>
                    </div>
                    <Link to="/"><Button className="w-full py-4 rounded-2xl">Return to Showroom</Button></Link>
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
                <h2 className="text-3xl font-bold mb-4">Your Gallery is Empty</h2>
                <p className="text-slate-500 mb-10">Choose your favorite masterpieces to begin.</p>
                <Link to="/products"><Button variant="primary" size="lg" className="px-12">Browse Collection</Button></Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-24 bg-slate-50/50 min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl w-full text-left">
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 sm:gap-10">
                    <div className="lg:col-span-2 w-full">
                        <form id="order-form" onSubmit={handleOrder} className="space-y-8">
                            <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3">
                                    <ShoppingBag className="text-primary-400 w-6 h-6 sm:w-8 sm:h-8" /> My Selections
                                </h1>
                                <div className="space-y-8">
                                    {cart.map((item) => (
                                        <div key={item.id} className="group flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-3 sm:p-4 hover:bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] transition-all border border-slate-50 sm:border-transparent w-full">
                                            <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-50">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700" />
                                            </div>
                                            <div className="flex-grow text-center sm:text-left w-full sm:w-auto">
                                                <h3 className="font-bold text-lg sm:text-xl text-slate-800 mb-1 leading-tight">{item.name}</h3>
                                                <p className="text-slate-400 text-xs sm:text-sm mb-2">{item.category}</p>
                                                <p className="text-primary-400 font-black text-lg">{item.price.toLocaleString()} DZD</p>
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

                            <div className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-400 flex items-center justify-center">
                                        <MapPin size={20} />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold">Shipping Details</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Full Identity</label>
                                            <input
                                                type="text" required value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800 shadow-inner text-sm sm:text-base"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Active Phone</label>
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
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Wilaya</label>
                                            <select
                                                required value={formData.wilaya}
                                                onChange={e => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base"
                                            >
                                                <option value="">Select Region</option>
                                                {Object.entries(ALGERIA_REGIONS).map(([code, data]) => (
                                                    <option key={code} value={code}>{code} - {data.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Commune</label>
                                            <select
                                                required value={formData.commune} disabled={!formData.wilaya}
                                                onChange={e => setFormData({ ...formData, commune: e.target.value })}
                                                className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                                            >
                                                <option value="">Select Municipality</option>
                                                {formData.wilaya && ALGERIA_REGIONS[formData.wilaya].communes.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Precise Address</label>
                                        <input
                                            type="text" required value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-5 py-3 sm:px-8 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800 shadow-inner text-sm sm:text-base"
                                            placeholder="Street, Building, Flat number..."
                                        />
                                    </div>
                                </div>
                            </div>


                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-primary-50 sticky top-32 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/30 rounded-full blur-3xl -z-10" />
                            <h2 className="text-2xl font-bold mb-8 tracking-tight">Order Summary</h2>

                            <div className="space-y-6 mb-10 text-slate-600">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-medium">Gallery Total</span>
                                    <span className="font-bold text-slate-900 tracking-tight">{cartTotal.toLocaleString()} DZD</span>
                                </div>

                                <div className="flex justify-between items-start animate-fade-in py-6 border-y border-slate-50">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">Delivery Fee</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                            Home Delivery
                                        </span>
                                    </div>
                                    <span className="font-bold text-primary-400">+{deliveryFee.toLocaleString()} DZD</span>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Total To Pay</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter mt-1">
                                            {finalTotal.toLocaleString()} <span className="text-xl font-bold">DZD</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="order-form"
                                disabled={loading}
                                className="w-full py-5 text-xl font-black shadow-2xl shadow-primary-200 rounded-[1.5rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                                {loading ? 'Processing...' : <><Wallet size={24} /> Confirm Order</>}
                            </Button>

                            <div className="mt-8 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl text-[11px] text-slate-500 border border-slate-100 leading-relaxed">
                                <ShieldCheck size={20} className="text-primary-400 shrink-0" />
                                <span>Payment is made via <strong>Cash on Delivery (COD)</strong> upon receipt of your package.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
