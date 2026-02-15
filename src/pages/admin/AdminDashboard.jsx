import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/config';
import { uploadImage } from '../../services/cloudinary/cloudinaryService';
import { Button } from '../../components/common/Button';
import { Plus, Trash2, Edit2, LogOut, Package, ShoppingBag, TrendingUp, Image as ImageIcon, X, LayoutDashboard, Tag, Bell, Settings, Menu, Home, MapPin, Eye, CheckCircle, RotateCcw, Truck, Check } from 'lucide-react';

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
        image: null,
        isPromo: false
    });
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();

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
                image: imageUrl,
                updatedAt: new Date(),
            };

            if (editingProduct) {
                await updateDoc(doc(db, "products", editingProduct.id), productData);
            } else {
                await addDoc(collection(db, "products"), { ...productData, createdAt: new Date() });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', price: '', oldPrice: '', category: '', image: null, isPromo: false });
            fetchProducts();
        } catch (error) {
            alert("Error saving product: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
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

    const deleteOrder = async (id) => {
        if (window.confirm("Delete this order record permanently?")) {
            await deleteDoc(doc(db, "orders", id));
            fetchOrders();
        }
    };

    const stats = [
        { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
        { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
        { label: 'Revenue', value: `${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()} DZD`, icon: TrendingUp, color: 'bg-primary-50 text-primary-600' },
    ];

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Tag },
        { id: 'orders', label: 'Orders', icon: Bell },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading && !products.length) return <div className="h-screen flex items-center justify-center">Loading Admin Portal...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Admin Header */}
            <div className="md:hidden bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 sticky top-0 z-[60]">
                <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-primary-400 transition-colors">
                    <Home size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl premium-gradient shadow-lg shadow-primary-100" />
                    <span className="font-black tracking-tighter">Admin Portal</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                w-72 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-[55] transition-transform duration-300 md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 border-b border-slate-50 hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl premium-gradient shadow-lg shadow-primary-100" />
                        <span className="font-black text-xl tracking-tighter">Ha-Design</span>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2 mt-20 md:mt-0">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-primary-50 hover:text-primary-400 transition-all font-black uppercase tracking-widest text-[10px] mb-4 border-2 border-dashed border-slate-100"
                    >
                        <Home size={20} />
                        Back to Store
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
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">
                        <LogOut size={22} />
                        Logout
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
            <main className="flex-grow md:ml-72 p-6 md:p-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
                        <p className="text-slate-400 mt-2">Active Admin Session: {user?.email}</p>
                    </div>
                    <Button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', oldPrice: '', category: '', image: null, isPromo: false }); setIsModalOpen(true); }} className="w-full md:w-auto gap-3 px-8 py-4 shadow-xl shadow-primary-200">
                        <Plus size={22} /> Add New Art
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stats.map((stat) => (
                                <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-8 transition-all hover:shadow-xl hover:shadow-slate-200/50">
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
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                            <h2 className="text-2xl font-black mb-8">Performance Overview</h2>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold">
                                No activity records yet. Start by adding your first product.
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'products' || activeTab === 'dashboard') && (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Gallery Catalog</h2>
                            <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">{products.length} Items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Masterpiece</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Price Point</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <img src={product.image} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                                                        {product.isPromo && (
                                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg border-2 border-white">
                                                                PROMO
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-lg mb-1">{product.name}</p>
                                                        <p className="text-slate-400 text-xs font-medium italic">ID: {product.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold">{product.category}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-lg">{product.price.toLocaleString()} DZD</span>
                                                    {product.oldPrice && (
                                                        <span className="text-slate-400 text-sm line-through decoration-red-400 decoration-2">{product.oldPrice.toLocaleString()} DZD</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Incoming Orders</h2>
                            <span className="bg-primary-50 text-primary-400 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">{orders.length} Total</span>
                        </div>
                        <div className="overflow-x-auto">
                            {orders.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Products</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-8">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-black text-slate-900 text-lg">#{order.id.slice(-6).toUpperCase()}</p>
                                                            <button
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="p-2 text-primary-400 hover:bg-primary-50 rounded-xl transition-all"
                                                                title="View All Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
                                                            {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                        <p className="font-black text-primary-400 text-sm mt-3">{order.total?.toLocaleString()} DZD</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-slate-800">{order.customer?.fullName}</p>
                                                        <p className="text-slate-500 text-sm font-medium">{order.customer?.phone}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 inline-block">
                                                            <MapPin size={10} /> {order.customer?.wilaya} - {order.customer?.commune}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex flex-wrap gap-3">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="relative group/img">
                                                                <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-contain bg-slate-50 shadow-sm border border-white p-1" />
                                                                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex flex-col items-end gap-3">
                                                        <div className="flex gap-2">
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                                                                >
                                                                    <CheckCircle size={12} /> Confirm
                                                                </button>
                                                            )}
                                                            {(order.status === 'confirmed' || order.status === 'shipped') && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all"
                                                                >
                                                                    <Truck size={12} /> Deliver
                                                                </button>
                                                            )}
                                                            {order.status !== 'pending' && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id, 'pending')}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                                                                >
                                                                    <RotateCcw size={12} /> Reset
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`
                                                                px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
                                                                ${order.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                                                    order.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-500' :
                                                                        order.status === 'shipped' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                                                                            'bg-green-50 border-green-100 text-green-500'}
                                                            `}>
                                                                {order.status}
                                                            </span>
                                                            <button
                                                                onClick={() => deleteOrder(order.id)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
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
                                    <p className="text-slate-400 font-bold text-xl italic">The art collection awaits its buyers...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl animate-fade-up relative max-h-[95vh] overflow-y-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={32} />
                        </button>
                        <h2 className="text-4xl font-black mb-10 tracking-tighter text-slate-900">
                            {editingProduct ? 'Refine Masterpiece' : 'New Creation'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-black text-slate-800 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text" required value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold"
                                    placeholder="Enter artwork title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-black text-slate-800 uppercase tracking-widest ml-1">Current Price (DZD)</label>
                                    <input
                                        type="number" required value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-black text-slate-800 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        value={formData.category} required
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Genre</option>
                                        <option value="Abstract">Abstract</option>
                                        <option value="Landscape">Landscape</option>
                                        <option value="Minimalist">Minimalist</option>
                                        <option value="Floral">Floral</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-end">
                                <div className="space-y-4">
                                    <label className="block text-sm font-black text-slate-800 uppercase tracking-widest ml-1">Old Price (Optional)</label>
                                    <input
                                        type="number" value={formData.oldPrice}
                                        onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                                        className="w-full px-8 py-5 bg-slate-50 rounded-[1.8rem] border-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all text-lg font-bold"
                                        placeholder="Add discount ref"
                                    />
                                </div>
                                <div className="pb-2">
                                    <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-5 rounded-[1.8rem] hover:bg-primary-50 transition-colors border-2 border-transparent hover:border-primary-100">
                                        <input
                                            type="checkbox" checked={formData.isPromo}
                                            onChange={e => setFormData({ ...formData, isPromo: e.target.checked })}
                                            className="w-6 h-6 rounded-lg text-primary-400 focus:ring-primary-100 border-slate-200"
                                        />
                                        <span className="text-lg font-black text-slate-700 group-hover:text-primary-500">Enable Promo Badge</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4 text-center">
                                <label className="block text-sm font-black text-slate-800 uppercase tracking-widest ml-1 text-left">Masterpiece Capture</label>
                                <div className="relative group border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-primary-200 transition-all bg-slate-50/50">
                                    <input
                                        type="file" accept="image/*"
                                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <ImageIcon className="mx-auto text-slate-200 mb-6 group-hover:text-primary-300 transition-colors" size={64} />
                                    <p className="text-slate-400 font-bold">Tap to upload high-res image</p>
                                    {formData.image && <p className="text-primary-400 text-lg mt-6 font-black animate-bounce">{formData.image.name}</p>}
                                </div>
                            </div>

                            <Button disabled={uploading} className="w-full py-6 text-xl font-black shadow-2xl shadow-primary-200/50 rounded-[2rem]" type="submit">
                                {uploading ? 'Imprinting Art...' : editingProduct ? 'Synchronize Updates' : 'Publish to Showroom'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl animate-fade-up relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={32} />
                        </button>

                        <div className="mb-10 text-center">
                            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Order Details</h2>
                            <p className="text-primary-400 font-black uppercase tracking-widest text-sm italic">#{selectedOrder.id.toUpperCase()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-12">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Customer Details</h4>
                                <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                                    <p className="font-black text-slate-800 text-lg">{selectedOrder.customer.fullName}</p>
                                    <p className="font-bold text-slate-500">{selectedOrder.customer.phone}</p>
                                    <div className="pt-4 mt-4 border-t border-slate-200">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <MapPin size={12} /> Shipping Address
                                        </div>
                                        <p className="font-bold text-slate-700 mt-2">{selectedOrder.customer.wilaya}, {selectedOrder.customer.commune}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status Control</h4>
                                <div className="p-6 bg-slate-50 rounded-3xl flex flex-col gap-3">
                                    <button
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'confirmed'); setSelectedOrder({ ...selectedOrder, status: 'confirmed' }); }}
                                        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${selectedOrder.status === 'confirmed' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-blue-600 border border-blue-50 hover:bg-blue-50'}`}
                                    >
                                        <CheckCircle size={14} /> Confirm
                                    </button>
                                    <button
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'delivered'); setSelectedOrder({ ...selectedOrder, status: 'delivered' }); }}
                                        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'bg-white text-green-600 border border-green-50 hover:bg-green-50'}`}
                                    >
                                        <Truck size={14} /> Deliver
                                    </button>
                                    <button
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'pending'); setSelectedOrder({ ...selectedOrder, status: 'pending' }); }}
                                        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${selectedOrder.status === 'pending' ? 'bg-slate-800 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'}`}
                                    >
                                        <RotateCcw size={14} /> Reset to Pending
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Order Items</h4>
                            <div className="space-y-4">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-4 border border-slate-50 rounded-[2rem] hover:bg-slate-50 transition-colors">
                                        <img src={item.image} alt="" className="w-20 h-20 rounded-2xl object-contain bg-slate-50 shadow-sm border border-white p-2" />
                                        <div className="flex-1">
                                            <p className="font-black text-slate-900 text-lg">{item.name}</p>
                                            <p className="text-slate-400 font-bold italic text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-black text-slate-900 text-xl tracking-tighter">{(item.price * item.quantity).toLocaleString()} DZD</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t-4 border-double border-slate-100 flex justify-between items-center">
                                <span className="text-xl font-black text-slate-400 tracking-widest uppercase">Total Amount</span>
                                <span className="text-4xl font-black text-primary-400 tracking-tighter">{selectedOrder.total?.toLocaleString()} DZD</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
