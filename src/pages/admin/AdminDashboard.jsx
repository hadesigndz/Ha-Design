import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/config';
import { uploadImage } from '../../services/cloudinary/cloudinaryService';
import { createGoLivriOrder } from '../../services/delivery/golivriService';
import { Button } from '../../components/common/Button';
import { Plus, Trash2, Edit2, LogOut, Package, ShoppingBag, TrendingUp, Image as ImageIcon, X, LayoutDashboard, Tag, Bell, Settings, Menu, Home, MapPin, Eye, CheckCircle, RotateCcw, Truck, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { serverTimestamp } from 'firebase/firestore';

export function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        oldPrice: '',
        category: '',
        description: '',
        image: null,
        isPromo: false
    });
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();
    const { t, lang } = useLanguage();

    const [error, setError] = useState(null);

    useEffect(() => {
        // Force back button to go home when leaving admin
        const handleBackButton = async () => {
            await signOut(auth);
            navigate('/');
        };
        window.allreadyInAdmin = true;
        window.addEventListener('popstate', handleBackButton);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [navigate]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProducts();
                fetchOrders();
            } else {
                navigate('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "orders"));
            const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by date descending
            ordersList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setOrders(ordersList);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsList);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = editingProduct?.image || '';

            if (formData.image && typeof formData.image !== 'string') {
                imageUrl = await uploadImage(formData.image);
            }

            const productData = {
                name: formData.name,
                price: Number(formData.price),
                oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
                isPromo: formData.isPromo,
                category: formData.category,
                description: formData.description || '',
                image: imageUrl,
                updatedAt: serverTimestamp(),
            };

            if (editingProduct) {
                await updateDoc(doc(db, "products", editingProduct.id), productData);
            } else {
                await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', price: '', oldPrice: '', category: '', description: '', image: null, isPromo: false });
            fetchProducts();
        } catch (error) {
            alert(t('admin.failSync') + " " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('admin.confirmDeleteProduct'))) {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        }
    };

    const updateOrderStatus = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", id), { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const handleManualSync = async (order) => {
        if (!order.customer) return;

        const confirmSync = window.confirm(t('admin.syncConfirm').replace('#', `#${order.id.slice(-6).toUpperCase()}`));
        if (!confirmSync) return;

        try {
            const result = await createGoLivriOrder({
                orderId: order.id,
                fullName: order.customer.fullName,
                phone: order.customer.phone,
                wilaya: order.customer.wilaya,
                commune: order.customer.commune,
                address: order.customer.address,
                total: order.total,
                items: order.items
            });

            if (result && result.success) {
                const code = result.trackingCode || result.code_suivi || result.tracking_code || result.code;
                if (code) {
                    await updateDoc(doc(db, "orders", order.id), {
                        deliveryTracking: code,
                        status: 'shipped' // Progress from confirmed to shipped
                    });
                    alert(`✅ ${t('admin.successSync').replace('#', code)}`);
                } else {
                    await updateDoc(doc(db, "orders", order.id), { status: 'shipped' });
                    alert(`✅ ${t('admin.successSyncManual')}`);
                }
                fetchOrders();
                if (selectedOrder) setSelectedOrder({ ...selectedOrder, deliveryTracking: code || selectedOrder.deliveryTracking, status: 'shipped' });
            } else {
                const errorDetail = result?.message || result?.error || "Unknown Error";
                alert(`❌ ${t('admin.failSync')} ${errorDetail}`);
            }
        } catch (err) {
            alert(`❌ ${t('admin.failSync')} ${err.message}`);
        }
    };

    const deleteOrder = async (id) => {
        if (window.confirm(t('admin.confirmDeleteOrder'))) {
            await deleteDoc(doc(db, "orders", id));
            fetchOrders();
        }
    };

    const stats = [
        { label: t('admin.totalProducts'), value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
        { label: t('admin.totalOrders'), value: orders.length, icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
        { label: t('admin.revenue'), value: `${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()} ${t('common.dzd')}`, icon: TrendingUp, color: 'bg-primary-50 text-primary-600' },
    ];

    const sidebarItems = [
        { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
        { id: 'products', label: t('admin.products'), icon: Tag },
        { id: 'orders', label: t('admin.orders'), icon: Bell },
        { id: 'settings', label: t('admin.settings'), icon: Settings },
    ];

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [orderFilter, setOrderFilter] = useState('all');

    const filteredOrders = useMemo(() => {
        if (orderFilter === 'all') return orders;
        return orders.filter(o => o.status === orderFilter);
    }, [orders, orderFilter]);

    if (loading && !products.length) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Admin Header */}
            <div className={`md:hidden bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 sticky top-0 z-[60]`}>
                <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-primary-400 transition-colors">
                    <Home size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl premium-gradient shadow-lg shadow-primary-100" />
                    <span className="font-black tracking-tighter">{t('admin.dashboard')}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                w-72 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 ${lang === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'} z-[55] transition-transform duration-300 md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}
            `}>
                <div className={`p-8 border-b border-slate-50 hidden md:block`}>
                    <div className={`flex items-center gap-3`}>
                        <div className="w-10 h-10 rounded-xl premium-gradient shadow-lg shadow-primary-100" />
                        <span className="font-black text-xl tracking-tighter">Ha-Design</span>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2 mt-20 md:mt-0">
                    <button
                        onClick={() => navigate('/')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-primary-50 hover:text-primary-400 transition-all font-black uppercase tracking-widest text-[10px] mb-4 border-2 border-dashed border-slate-100`}
                    >
                        <Home size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
                        {t('admin.backToStore')}
                    </button>

                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === item.id ? 'bg-primary-50 text-primary-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                            <item.icon size={22} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-50">
                    <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold`}>
                        <LogOut size={22} className={lang === 'ar' ? 'rotate-180' : ''} />
                        {t('admin.logout')}
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`flex-grow ${lang === 'ar' ? 'md:mr-72' : 'md:ml-72'} p-6 md:p-12 text-start`}>
                <header className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
                        <p className="text-slate-400 mt-2">{t('admin.activeSession')} {user?.email}</p>
                    </div>
                    <Button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', oldPrice: '', category: '', image: null, isPromo: false }); setIsModalOpen(true); }} className="w-full md:w-auto gap-3 px-8 py-4 shadow-xl shadow-primary-200 font-black uppercase tracking-widest text-xs">
                        <Plus size={22} /> {t('admin.addNewArt')}
                    </Button>
                </header>

                {error && (
                    <div className="mb-10 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 animate-fade-in shadow-lg shadow-red-50">
                        <div className="p-3 bg-red-500 text-white rounded-xl shadow-md">
                            <X size={20} />
                        </div>
                        <div>
                            <p className="font-black text-lg">Firebase Connection Error</p>
                            <p className="text-sm font-bold opacity-80">{error}. Please check your Firestore Security Rules.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="space-y-12">
                        {/* Stats Grid */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8`}>
                            {stats.map((stat) => (
                                <div key={stat.label} className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-8 transition-all hover:shadow-xl hover:shadow-slate-200/50`}>
                                    <div className={`p-5 rounded-[1.5rem] ${stat.color} shadow-inner`}>
                                        <stat.icon size={32} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Mock */}
                        <div className={`bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 ${lang === 'ar' ? 'text-right' : ''}`}>
                            <h2 className="text-2xl font-black mb-8">{t('admin.performance')}</h2>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold">
                                {t('admin.noActivity')}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'products' || activeTab === 'dashboard') && (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className={`p-8 border-b border-slate-50 flex justify-between items-center`}>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('admin.galleryCatalog')}</h2>
                            <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">{products.length} {t('admin.items')}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-start`}>{t('admin.masterpiece')}</th>
                                        <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-start`}>{t('common.category')}</th>
                                        <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-start`}>{t('admin.pricePoint')}</th>
                                        <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-end`}>{t('admin.management')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className={`flex items-center gap-6`}>
                                                    <div className="relative">
                                                        <img src={product.image} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                                                        {product.isPromo && (
                                                            <div className={`absolute -top-2 ${lang === 'ar' ? '-left-2' : '-right-2'} bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg border-2 border-white`}>
                                                                {t('common.sale')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-lg mb-1">{product.name}</p>
                                                        <p className="text-slate-400 text-xs font-medium italic">ID: {product.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-8 py-6 ${lang === 'ar' ? 'text-right' : ''}`}>
                                                <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold">{t(`categories.${product.category.toLowerCase()}`)}</span>
                                            </td>
                                            <td className={`px-8 py-6 ${lang === 'ar' ? 'text-right' : ''}`}>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-lg">{product.price.toLocaleString()} {t('common.dzd')}</span>
                                                    {product.oldPrice && (
                                                        <span className="text-slate-400 text-sm line-through decoration-red-400 decoration-2">{product.oldPrice.toLocaleString()} {t('common.dzd')}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`px-8 py-6 text-end`}>
                                                <div className={`flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity justify-end`}>
                                                    <button
                                                        onClick={() => { setEditingProduct(product); setFormData({ ...product, image: null }); setIsModalOpen(true); }}
                                                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors shadow-sm bg-white"
                                                    >
                                                        <Edit2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors shadow-sm bg-white"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className={`p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30`}>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('admin.incomingOrders')}</h2>
                            <span className="bg-primary-50 text-primary-400 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">{orders.length} {t('common.all')}</span>
                        </div>
                        <div className="overflow-x-auto">
                            {/* Order Tabs */}
                            <div className={`flex gap-2 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-full overflow-x-auto no-scrollbar ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                {[
                                    { id: 'all', label: t('orderStatus.all'), color: 'slate' },
                                    { id: 'pending', label: t('orderStatus.pending'), color: 'amber' },
                                    { id: 'confirmed', label: t('orderStatus.confirmed'), color: 'blue' },
                                    { id: 'shipped', label: t('orderStatus.sendToDelivery'), color: 'indigo' },
                                    { id: 'delivered', label: t('orderStatus.delivered'), color: 'green' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setOrderFilter(tab.id)}
                                        className={`
                                            px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center whitespace-nowrap
                                            ${orderFilter === tab.id
                                                ? `bg-slate-900 text-white shadow-xl shadow-slate-200`
                                                : `bg-transparent text-slate-400 hover:bg-slate-50`
                                            }
                                        `}
                                    >
                                        {tab.label}
                                        <span className={`
                                            px-2 py-0.5 rounded-lg text-[8px]
                                            ${orderFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {filteredOrders.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="border-b-4 border-double border-slate-50">
                                        <tr>
                                            <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-start`}>{t('admin.orderInfo')}</th>
                                            <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-start`}>{t('admin.customer')}</th>
                                            <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-start`}>{t('admin.products')}</th>
                                            <th className={`px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-end`}>{t('admin.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-8">
                                                    <div className={`space-y-1`}>
                                                        <div className={`flex items-center gap-3`}>
                                                            <p className="font-black text-slate-900 text-lg">#{order.id.slice(-6).toUpperCase()}</p>
                                                            <button
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="p-2 text-primary-400 hover:bg-primary-50 rounded-xl transition-all"
                                                                title={t('admin.orderDetail')}
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
                                                            {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                        <p className="font-black text-primary-400 text-sm mt-3">{order.total?.toLocaleString()} {t('common.dzd')}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className={`space-y-1`}>
                                                        <p className="font-bold text-slate-800">{order.customer?.fullName}</p>
                                                        <p className="text-slate-500 text-sm font-medium">{order.customer?.phone}</p>
                                                        <div className={`flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 inline-block`}>
                                                            <MapPin size={10} /> {order.customer?.wilaya} - {order.customer?.commune}
                                                        </div>
                                                        {order.deliveryTracking && (
                                                            <div className={`flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest mt-2 p-2 bg-primary-50 rounded-xl border border-primary-100`}>
                                                                <Truck size={10} /> {order.deliveryTracking}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className={`flex flex-wrap gap-3`}>
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="relative group/img">
                                                                <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-contain bg-slate-50 shadow-sm border border-white p-1" />
                                                                <span className={`absolute -top-2 ${lang === 'ar' ? '-left-2' : '-right-2'} bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white`}>{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className={`flex flex-col items-end gap-4`}>
                                                        <div className={`flex flex-wrap gap-2 justify-end`}>
                                                            {/* PRIMARY ACTION BASED ON STATUS */}
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                                                >
                                                                    <CheckCircle size={14} /> {t('orderStatus.confirmOrder')}
                                                                </button>
                                                            )}

                                                            {order.status === 'confirmed' && !order.deliveryTracking && (
                                                                <button
                                                                    onClick={() => handleManualSync(order)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                                                                >
                                                                    <Truck size={14} /> {t('orderStatus.sendToDelivery')}
                                                                </button>
                                                            )}

                                                            {/* SHIPPED -> DELIVERED */}
                                                            {order.status === 'shipped' && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                                                                >
                                                                    <CheckCircle size={14} /> {t('orderStatus.markDelivered')}
                                                                </button>
                                                            )}

                                                            {/* SECONDARY ACTIONS */}
                                                            {order.status !== 'pending' && (
                                                                <button
                                                                    onClick={() => {
                                                                        const clearTracking = window.confirm(t('admin.confirmReset'));
                                                                        if (clearTracking) updateOrderStatus(order.id, 'pending');
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                                    title={t('orderStatus.reset')}
                                                                >
                                                                    <RotateCcw size={14} /> {t('orderStatus.reset')}
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => deleteOrder(order.id)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                                                            >
                                                                <Trash2 size={14} /> {t('common.delete')}
                                                            </button>
                                                        </div>

                                                        {/* STATUS BADGE */}
                                                        <div className="flex items-center gap-3">
                                                            <span className={`
                                                                 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                                                 ${order.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                                                    order.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-500' :
                                                                        order.status === 'shipped' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                                                                            order.status === 'delivered' ? 'bg-green-50 border-green-100 text-green-500' :
                                                                                'bg-slate-50 border-slate-100 text-slate-500'}
                                                             `}>
                                                                {t(`orderStatus.${order.status}`)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-96 flex flex-col items-center justify-center p-12 text-center">
                                    <ShoppingBag size={64} className="text-slate-100 mb-6" />
                                    <p className="text-slate-400 font-bold text-xl italic">{t('admin.noActivity')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                        <h2 className="text-2xl font-black mb-8">{t('admin.adminSettings')}</h2>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold">
                            {t('admin.settingsSoon')}
                        </div>
                    </div>
                )}
            </main>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                    <div className={`bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl animate-fade-up relative max-h-[95vh] overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={32} />
                        </button>
                        <h2 className="text-4xl font-black mb-10 tracking-tighter text-slate-900">
                            {editingProduct ? t('admin.refineMasterpiece') : t('admin.newCreation')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className={`block text-sm font-black text-slate-800 uppercase tracking-widest ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>{t('admin.title')}</label>
                                <input
                                    type="text" required value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold ${lang === 'ar' ? 'text-right' : ''}`}
                                    placeholder={t('admin.enterArtworkTitle')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className={`block text-sm font-black text-slate-800 uppercase tracking-widest ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>{t('admin.currentPrice')}</label>
                                    <input
                                        type="number" required value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className={`w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold ${lang === 'ar' ? 'text-right' : ''}`}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className={`block text-sm font-black text-slate-800 uppercase tracking-widest ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>{t('common.category')}</label>
                                    <select
                                        value={formData.category} required
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className={`w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold appearance-none cursor-pointer ${lang === 'ar' ? 'text-right' : ''}`}
                                    >
                                        <option value="">{t('admin.selectGenre')}</option>
                                        <option value="Modern">{t('categories.modern')}</option>
                                        <option value="Classic">{t('categories.classic')}</option>
                                        <option value="Abstract">{t('categories.abstract')}</option>
                                        <option value="Islamic">{t('categories.islamic')}</option>
                                        <option value="Landscape">{t('categories.landscape')}</option>
                                        <option value="Minimalist">{t('categories.minimalist')}</option>
                                        <option value="Floral">{t('categories.floral')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className={`block text-sm font-black text-slate-800 uppercase tracking-widest ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>{t('admin.description')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold min-h-[120px] ${lang === 'ar' ? 'text-right' : ''}`}
                                    placeholder={t('admin.describeMasterpiece')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-end">
                                <div className="space-y-4">
                                    <label className={`block text-sm font-black text-slate-800 uppercase tracking-widest ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>{t('admin.oldPrice')}</label>
                                    <input
                                        type="number" value={formData.oldPrice}
                                        onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                                        className={`w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold ${lang === 'ar' ? 'text-right' : ''}`}
                                        placeholder={t('admin.addDiscountRef')}
                                    />
                                </div>
                                <div className="pb-2">
                                    <label className={`flex items-center gap-4 cursor-pointer group bg-slate-50 p-5 rounded-[1.8rem] hover:bg-primary-50 transition-colors border-2 border-transparent hover:border-primary-100 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                        <input
                                            type="checkbox" checked={formData.isPromo}
                                            onChange={e => setFormData({ ...formData, isPromo: e.target.checked })}
                                            className="w-6 h-6 rounded-lg text-primary-400 focus:ring-primary-100 border-slate-200"
                                        />
                                        <span className="text-lg font-black text-slate-700 group-hover:text-primary-500">{t('admin.enablePromoBadge')}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className={`block text-sm font-black text-slate-800 uppercase tracking-widest ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>{t('admin.masterpieceCapture')}</label>
                                <div className="relative group border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-primary-200 transition-all bg-slate-50/50 text-center">
                                    <input
                                        type="file" accept="image/*"
                                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <ImageIcon className="mx-auto text-slate-200 mb-6 group-hover:text-primary-300 transition-colors" size={64} />
                                    <p className="text-slate-400 font-bold">{t('admin.tapToUpload')}</p>
                                    {formData.image && <p className="text-primary-400 text-lg mt-6 font-black animate-bounce">{formData.image.name}</p>}
                                </div>
                            </div>

                            <Button disabled={uploading} className="w-full py-6 text-xl font-black shadow-2xl shadow-primary-200/50 rounded-[2rem]" type="submit">
                                {uploading ? t('admin.imprintingArt') : editingProduct ? t('admin.synchronizeUpdates') : t('admin.publishToShowroom')}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className={`bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${lang === 'ar' ? 'text-right' : ''}`}>
                        <div className={`p-8 bg-slate-900 text-white flex justify-between items-center`}>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{t('admin.orderDetail')}</h2>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">#{selectedOrder.id.toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-2 h-2 rounded-full bg-primary-400" />
                                            {t('admin.customerDetails')}
                                        </h3>
                                        <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('cart.fullName')}</p>
                                                    <p className="font-bold text-slate-900 text-lg">{selectedOrder.customer.fullName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('cart.phone')}</p>
                                                    <p className="font-bold text-slate-900 text-lg">{selectedOrder.customer.phone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3`}>
                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                {t('admin.shippingAddress')}
                                            </h3>
                                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('cart.wilaya')}</p>
                                                    <p className="font-bold text-slate-900">{selectedOrder.customer.wilaya} - {selectedOrder.customer.commune}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('cart.address')}</p>
                                                    <p className="text-slate-600 leading-relaxed font-medium">{selectedOrder.customer.address}</p>
                                                </div>
                                                {selectedOrder.deliveryTracking && (
                                                    <div className="pt-4 mt-4 border-t border-slate-100">
                                                        <div className={`flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1`}>
                                                            <Truck size={12} /> {t('admin.deliveryTracking')}
                                                        </div>
                                                        <p className="font-mono font-black text-primary-600 text-lg tracking-wider">{selectedOrder.deliveryTracking}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3`}>
                                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                {t('admin.statusControl')}
                                            </h3>
                                            <div className="space-y-3">
                                                {[
                                                    { id: 'pending', label: t('orderStatus.pending'), icon: RotateCcw, color: 'hover:bg-amber-50 hover:text-amber-600' },
                                                    { id: 'confirmed', label: t('orderStatus.confirmed'), icon: Check, color: 'hover:bg-blue-50 hover:text-blue-600' },
                                                    { id: 'shipped', label: t('orderStatus.sendToDelivery'), icon: Truck, color: 'hover:bg-indigo-50 hover:text-indigo-600' },
                                                    { id: 'delivered', label: t('orderStatus.delivered'), icon: CheckCircle, color: 'hover:bg-green-50 hover:text-green-600' }
                                                ].map(status => (
                                                    <button
                                                        key={status.id}
                                                        onClick={() => {
                                                            if (status.id === 'confirmed' && selectedOrder.status === 'pending') {
                                                                updateOrderStatus(selectedOrder.id, 'confirmed');
                                                                setSelectedOrder({ ...selectedOrder, status: 'confirmed' });
                                                            } else if (status.id === 'shipped' && selectedOrder.status === 'confirmed' && !selectedOrder.deliveryTracking) {
                                                                handleManualSync(selectedOrder);
                                                            } else if (status.id === 'delivered' && selectedOrder.status === 'shipped') {
                                                                updateOrderStatus(selectedOrder.id, 'delivered');
                                                                setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                                                            } else if (status.id === 'pending' && selectedOrder.status !== 'pending') {
                                                                const clearTracking = window.confirm(t('admin.confirmReset'));
                                                                if (clearTracking) {
                                                                    updateOrderStatus(selectedOrder.id, 'pending');
                                                                    setSelectedOrder({ ...selectedOrder, status: 'pending' });
                                                                }
                                                            }
                                                        }}
                                                        className={`
                                                            w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold border-2
                                                            ${selectedOrder.status === status.id
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                                                : `bg-white border-slate-50 text-slate-400 ${status.color}`
                                                            }
                                                        `}
                                                    >
                                                        <div className={`flex items-center gap-4`}>
                                                            <status.icon size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
                                                            {status.label}
                                                        </div>
                                                        {selectedOrder.status === status.id && <Check size={20} />}
                                                    </button>
                                                ))}
                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    <button
                                                        onClick={() => {
                                                            const clearTracking = window.confirm(t('admin.confirmReset'));
                                                            if (clearTracking) {
                                                                updateOrderStatus(selectedOrder.id, 'pending');
                                                                setSelectedOrder({ ...selectedOrder, status: 'pending' });
                                                            }
                                                        }}
                                                        className="py-3 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                                                    >
                                                        <RotateCcw size={14} /> {t('orderStatus.reset')}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteOrder(selectedOrder.id)}
                                                        className="py-3 bg-red-100 text-red-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-all"
                                                    >
                                                        <Trash2 size={14} /> {t('common.delete')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-100">
                                    <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3`}>
                                        <div className="w-2 h-2 rounded-full bg-primary-400" />
                                        {t('admin.orderItems')}
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className={`flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100`}>
                                                <div className={`flex items-center gap-6`}>
                                                    <img src={item.image} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-white" />
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg mb-1">{item.name}</p>
                                                        <p className="text-slate-400 text-sm font-bold">{item.quantity} x {item.price.toLocaleString()} {t('common.dzd')}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-slate-900 text-xl">{(item.quantity * item.price).toLocaleString()} {t('common.dzd')}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`mt-8 p-8 bg-slate-900 rounded-[2.5rem] flex items-center justify-between text-white`}>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">{t('admin.totalAmount')}</span>
                                        <span className="text-3xl font-black">{selectedOrder.total?.toLocaleString()} {t('common.dzd')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                                <Button
                                    className="w-full py-5 rounded-2xl font-black uppercase tracking-widest"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    {t('common.close')}
                                </Button>
                            </div>
                        </div>
                    </div>
            )}
                </div>
           )}
            </div>
        );
}
