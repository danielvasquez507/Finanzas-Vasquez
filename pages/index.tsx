"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Sun, Moon,
    CheckCircle2, ShoppingCart, Zap, Car, Heart, Hammer, CreditCard, Plane, MoreHorizontal,
    UploadCloud, X, Grid, ChevronRight, ChevronLeft,
    Briefcase, Coffee, Gift, Home, Smartphone, Music, BookOpen, Utensils,
    Dumbbell, Dog, GraduationCap, Wifi, Droplets, Tv, Gamepad2, Shirt,
    Scissors, Stethoscope, Pill, Bus, Fuel, Wrench, Baby, Trash2, Wallet, AlertCircle,
    Repeat, ArrowDownCircle, ArrowUpCircle, UserCircle2, Users, Pencil,
    Landmark, PiggyBank, Banknote, Coins, Receipt, Ticket, Clapperboard,
    Flower2, Trees, Palmtree, Mountain, Tent, Sofa, Bed, Bath, ShowerHead,
    Lightbulb, Plug, Package, Cat, Monitor, BarChart3, ListTodo, Settings, Edit3, PieChart, Phone
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

interface Category {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    subs: string[];
}

interface RecurringItem {
    id: number;
    type: string;
    name: string;
    amount: number;
    owner: string;
}

interface Transaction {
    id: number;
    date: string;
    category: string;
    sub: string;
    amount: number;
    notes: string;
    isPaid: boolean;
    week: string;
}


// ==========================================
// 1. UTILS & CONFIG
// ==========================================

const safeDate = (dateStr: string) => {
    try { return new Date(dateStr + 'T00:00:00'); } catch (e) { return new Date(); }
};

const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(new Date(start).setDate(start.getDate() + 6));
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const formatDateRange = (start: Date, end: Date) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('es-ES', opts)} - ${end.toLocaleDateString('es-ES', opts)}`;
};

const ICON_LIB: any = {
    'credit-card': <CreditCard size={20} />, 'landmark': <Landmark size={20} />, 'piggy-bank': <PiggyBank size={20} />,
    'banknote': <Banknote size={20} />, 'coins': <Coins size={20} />, 'receipt': <Receipt size={20} />, 'wallet': <Wallet size={20} />,
    'home': <Home size={20} />, 'zap': <Zap size={20} />, 'droplets': <Droplets size={20} />, 'wifi': <Wifi size={20} />,
    'phone': <Phone size={20} />, 'tv': <Tv size={20} />, 'sofa': <Sofa size={20} />, 'bed': <Bed size={20} />, 'bath': <Bath size={20} />,
    'shower': <ShowerHead size={20} />, 'lightbulb': <Lightbulb size={20} />, 'shopping-cart': <ShoppingCart size={20} />,
    'shirt': <Shirt size={20} />, 'scissors': <Scissors size={20} />, 'gift': <Gift size={20} />, 'package': <Package size={20} />,
    'smartphone': <Smartphone size={20} />, 'monitor': <Monitor size={20} />, 'plug': <Plug size={20} />, 'coffee': <Coffee size={20} />,
    'utensils': <Utensils size={20} />, 'clapperboard': <Clapperboard size={20} />, 'ticket': <Ticket size={20} />, 'gamepad': <Gamepad2 size={20} />,
    'music': <Music size={20} />, 'flower': <Flower2 size={20} />, 'car': <Car size={20} />, 'fuel': <Fuel size={20} />, 'bus': <Bus size={20} />,
    'plane': <Plane size={20} />, 'palmtree': <Palmtree size={20} />, 'mountain': <Mountain size={20} />, 'tent': <Tent size={20} />,
    'heart': <Heart size={20} />, 'stethoscope': <Stethoscope size={20} />, 'pill': <Pill size={20} />, 'dumbbell': <Dumbbell size={20} />,
    'baby': <Baby size={20} />, 'dog': <Dog size={20} />, 'cat': <Cat size={20} />, 'briefcase': <Briefcase size={20} />,
    'book': <BookOpen size={20} />, 'grad': <GraduationCap size={20} />, 'hammer': <Hammer size={20} />, 'wrench': <Wrench size={20} />,
    'more': <MoreHorizontal size={20} />, 'trees': <Trees size={20} />,
};

const OWNERS = ['Daniel', 'Gedalya', 'Ambos'];

const AI_PROMPT = `Actúa como contador. Analiza la imagen. Genera CSV: date,category,subcategory,amount,notes.
Reglas:
- date: YYYY-MM-DD
- category: Personal Daniel, Personal Gedalya, Personal Ambos, Supermercado, Servicios, Automóvil, Salud, Tarjeta Crédito.
- subcategory: Nombre del comercio.
- amount: Decimales.
Devuelve SOLO el bloque CSV.`;

const getWeekString = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    return `W${weekNum}`;
};

const mapApiToLocal = (tx: any): Transaction => {
    const d = tx.date ? new Date(tx.date) : new Date();
    return { ...tx, date: d.toISOString().split('T')[0] };
};

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [listMode, setListMode] = useState('table');
    const [darkMode, setDarkMode] = useState(true);

    // Filtros de Tiempo
    const [dashFilter, setDashFilter] = useState('week');
    const [viewDate, setViewDate] = useState(new Date());

    // Filtro de Recurrentes (Fijos)
    const [recurringTab, setRecurringTab] = useState('all');

    // Datos Globales
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recurring, setRecurring] = useState<RecurringItem[]>([]);


    const loadData = async () => {
        try {
            const [txRes, catRes, recRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/categories'),
                fetch('/api/recurring')
            ]);

            if (txRes.ok) setTransactions((await txRes.json()).map(mapApiToLocal));
            if (catRes.ok) setCategories(await catRes.json());
            if (recRes.ok) setRecurring(await recRes.json());
        } catch (e) {
            console.error("Error loading data", e);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Formulario TC
    const [amount, setAmount] = useState('');
    const [selectedCat, setSelectedCat] = useState<Category | null>(null);
    const [subCat, setSubCat] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [notes, setNotes] = useState('');

    // Formulario Recurrentes
    const [recType, setRecType] = useState('expense');
    const [recName, setRecName] = useState('');
    const [recAmount, setRecAmount] = useState('');
    const [recOwner, setRecOwner] = useState('Ambos');
    const [showRecModal, setShowRecModal] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState<any>(null);

    // Otros Modales
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [csvText, setCsvText] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isCopied, setIsCopied] = useState(false);


    // --- LOGICA DE NAVEGACION TIEMPO ---
    const navigateTime = (direction: number) => {
        const newDate = new Date(viewDate);
        if (dashFilter === 'week') {
            newDate.setDate(viewDate.getDate() + (direction * 7));
        } else if (dashFilter === 'month') {
            newDate.setMonth(viewDate.getMonth() + direction);
        } else {
            newDate.setFullYear(viewDate.getFullYear() + direction);
        }
        setViewDate(newDate);
    };

    const getTimeLabel = () => {
        if (dashFilter === 'week') {
            const { start, end } = getWeekRange(viewDate);
            return formatDateRange(start, end);
        } else if (dashFilter === 'month') {
            return viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        } else {
            return viewDate.getFullYear().toString();
        }
    };

    // --- CRUD MOVIMIENTOS (TC) ---
    const handleAddTransaction = async () => {
        if (!amount || !selectedCat || !subCat) return;

        const apiPayload = {
            date: new Date(date),
            category: selectedCat.name,
            sub: subCat,
            amount: parseFloat(amount),
            notes: notes
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload),
            });

            if (response.ok) {
                const savedTx = await response.json();
                setTransactions([mapApiToLocal(savedTx), ...transactions]);
                setAmount('');
                setSubCat('');
                setNotes('');
                alert("Gasto registrado");
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error(error);
            alert('Error al guardar.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Borrar movimiento?")) {
            try {
                const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setTransactions(transactions.filter(t => t.id !== id));
                    setEditingTx(null);
                } else {
                    alert('Error al borrar');
                }
            } catch (e) {
                alert('Error de conexión');
            }
        }
    };

    const handleUpdate = async () => {
        if (!editingTx) return;
        try {
            const res = await fetch(`/api/transactions?id=${editingTx.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTx)
            });

            if (res.ok) {
                const updated = await res.json();
                setTransactions(transactions.map(t => t.id === editingTx.id ? mapApiToLocal(updated) : t));
                setEditingTx(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const togglePaid = async (id: number) => {
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        const newVal = !tx.isPaid;
        // Optimistic update
        setTransactions(transactions.map(t => t.id === id ? { ...t, isPaid: newVal } : t));

        try {
            await fetch(`/api/transactions?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...tx, isPaid: newVal })
            });
        } catch (e) {
            console.error("Fred failed to sync paid status");
        }
    };

    // --- CRUD RECURRENTES ---
    const openNewRecModal = () => {
        setRecName(''); setRecAmount(''); setRecType('expense');
        setRecOwner(recurringTab !== 'all' ? recurringTab : 'Ambos');
        setEditingRecurring(null);
        setShowRecModal(true);
    };

    const openEditRecModal = (item: any) => {
        setRecName(item.name); setRecAmount(item.amount.toString());
        setRecType(item.type); setRecOwner(item.owner);
        setEditingRecurring(item);
        setShowRecModal(true);
    };

    const handleSaveRecurring = async () => {
        if (!recName || !recAmount) return;
        const val = parseFloat(recAmount);
        const payload = { type: recType, name: recName, amount: val, owner: recOwner };

        try {
            if (editingRecurring) {
                const res = await fetch('/api/recurring', { method: 'PUT', body: JSON.stringify({ ...payload, id: editingRecurring.id }), headers: { 'Content-Type': 'application/json' } });
                const updated = await res.json();
                setRecurring(recurring.map(r => r.id === editingRecurring.id ? updated : r));
            } else {
                const res = await fetch('/api/recurring', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
                const saved = await res.json();
                setRecurring([...recurring, saved]);
            }
            setShowRecModal(false); setRecName(''); setRecAmount(''); setEditingRecurring(null);
        } catch (e) {
            alert("Error guardando recurrente");
        }
    };

    const handleDeleteRecurring = async (id: number, e: any) => {
        e.stopPropagation();
        if (window.confirm("¿Eliminar este registro fijo?")) {
            await fetch(`/api/recurring?id=${id}`, { method: 'DELETE' });
            setRecurring(recurring.filter(r => r.id !== id));
            if (editingRecurring?.id === id) setShowRecModal(false);
        }
    };

    const getRecurringStats = () => {
        const activeItems = recurring.filter(r => recurringTab === 'all' || r.owner === recurringTab);
        const stats = { totalIncome: 0, totalExpense: 0 };
        activeItems.forEach(r => {
            if (r.type === 'income') stats.totalIncome += r.amount;
            else stats.totalExpense += r.amount;
        });
        return { stats, activeItems };
    };


    const { stats: recStats, activeItems: recList } = getRecurringStats();

    // --- GRÁFICOS Y DATOS ---
    const getFilteredData = () => {
        return transactions.filter(t => {
            const txDate = safeDate(t.date);
            const currentView = new Date(viewDate);
            if (dashFilter === 'year') return txDate.getFullYear() === currentView.getFullYear();
            if (dashFilter === 'month') return txDate.getMonth() === currentView.getMonth() && txDate.getFullYear() === currentView.getFullYear();
            const txWeek = getWeekRange(txDate);
            const viewWeek = getWeekRange(currentView);
            return txWeek.start.getTime() === viewWeek.start.getTime();
        });
    };

    const getChartData = () => {
        const data = getFilteredData();
        const totals: any = {};
        let totalSum = 0;
        data.forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + t.amount;
            totalSum += t.amount;
        });
        const sorted = Object.entries(totals).sort((a: any, b: any) => b[1] - a[1]).map(([name, val]: any) => ({ name, val }));
        return { sorted, totalSum };
    };

    // --- HELPERS ---
    const copyPrompt = () => { navigator.clipboard.writeText(AI_PROMPT); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };

    const handleBulkImport = async () => {
        if (!csvText) return;
        const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.includes(','));
        const newTxs = [];
        let errorCount = 0;

        for (const line of lines) {
            try {
                const parts = line.split(',').map(s => s.trim());
                if (parts.length < 4) {
                    errorCount++;
                    continue;
                }

                const [dateStr, catRaw, sub, amt, nts] = parts;
                const parseDate = new Date(dateStr);
                const parseAmount = parseFloat(amt);

                // Normalización de categoría basic
                const cat = catRaw; // Simplified for now

                if (isNaN(parseDate.getTime()) || isNaN(parseAmount)) {
                    errorCount++;
                    continue;
                }

                const apiPayload = {
                    date: parseDate,
                    category: cat,
                    sub: sub,
                    amount: parseAmount,
                    notes: nts || ''
                };

                const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiPayload),
                });

                if (res.ok) {
                    const saved = await res.json();
                    newTxs.push(mapApiToLocal(saved));
                } else {
                    errorCount++;
                }
            } catch (e) {
                errorCount++;
            }
        }

        if (newTxs.length > 0) {
            setTransactions(prev => [...newTxs, ...prev]);
            alert(`Importación: ${newTxs.length} éxitos, ${errorCount} errores.`);
        } else {
            alert("Error en importación.");
        }

        setShowBulkModal(false);
        setCsvText('');
        setActiveTab('list');
    };

    const saveCategoryEdit = async (newIconKey: string) => {
        if (!editingCategory) return;
        await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editingCategory.id,
                iconKey: newIconKey,
                subs: editingCategory.subs // Keep subs same
            })
        });
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, iconKey: newIconKey } : c));
        setEditingCategory(null);
    };

    const addSubcategory = async (catId: string) => {
        const newSub = prompt("Nombre:");
        if (newSub?.trim()) {
            const cat = categories.find(c => c.id === catId);
            if (!cat) return;
            const newSubs = [...cat.subs, newSub.trim()];

            await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: catId,
                    subs: newSubs
                })
            });

            setCategories(categories.map(c => c.id === catId ? { ...c, subs: newSubs } : c));
        }
    };

    const BarChart = ({ data }: { data: any[] }) => {
        if (data.length === 0) return <div className="text-center text-slate-400 py-8 text-xs italic">Sin datos</div>;
        const maxVal = Math.max(...data.map(i => i.val));
        return (
            <div className="space-y-3 mt-4">
                {data.map((item, i) => {
                    const percent = (item.val / maxVal) * 100;
                    const cat = categories.find(c => c.name === item.name) || { color: 'bg-slate-200', iconKey: 'more' };
                    return (
                        <div key={i} className="group">
                            <div className="flex justify-between text-xs mb-1">
                                <div className="flex items-center gap-1.5"><span className="text-slate-400">{ICON_LIB[cat.iconKey]}</span><span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span></div>
                                <span className="font-mono font-bold dark:text-white">${item.val.toFixed(2)}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 dynamic-bar ${cat.color.split(' ')[0]}`} style={{ '--progress-width': `${percent}%` } as React.CSSProperties}></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <div className={`h-screen w-full flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`}>

            {/* Container para Desktop */}
            <div className="w-full h-full max-w-md mx-auto flex flex-col bg-white dark:bg-slate-950 shadow-2xl overflow-hidden relative sm:border-x sm:border-slate-800">


                {/* --- HEADER --- */}
                <header className="flex-none px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center h-14 z-20">
                    <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                        Finanzas Familia Vásquez
                    </h1>
                    <div className="flex gap-2">
                        <button onClick={() => setShowBulkModal(true)} aria-label="Importar con IA" title="Importar con IA" className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"><UploadCloud size={18} /></button>
                        <button onClick={() => setDarkMode(!darkMode)} aria-label="Cambiar tema" title="Cambiar tema" className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                    </div>
                </header>

                {/* --- MAIN CONTENT SCROLLABLE --- */}
                <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50 dark:bg-slate-950/50">

                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="p-4 space-y-6 animate-in fade-in">
                            <div className="flex flex-col gap-3">
                                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex font-bold text-xs relative">{['week', 'month', 'year'].map(filter => (<button key={filter} onClick={() => { setDashFilter(filter); setViewDate(new Date()); }} aria-label={`Filtrar por ${filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}`} title={`Ver por ${filter === 'week' ? 'semana' : filter === 'month' ? 'mes' : 'año'}`} className={`flex-1 py-2 rounded-lg transition-all capitalize ${dashFilter === filter ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}>{filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}</button>))}</div>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800"><button onClick={() => navigateTime(-1)} aria-label="Anterior" title="Anterior" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ChevronLeft size={20} /></button><span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{getTimeLabel()}</span><button onClick={() => navigateTime(1)} aria-label="Siguiente" title="Siguiente" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ChevronRight size={20} /></button></div>
                            </div>
                            <div className="text-center py-2"><span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total Gastado (TC)</span><div className="text-4xl font-black text-slate-800 dark:text-white mt-1">${getChartData().totalSum.toFixed(2)}</div></div>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"><h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-2"><BarChart3 size={16} className="text-blue-500" /> Desglose por Categoría</h3><BarChart data={getChartData().sorted} /></div>
                        </div>
                    )}

                    {/* FIJOS (RECURRENTES) */}
                    {activeTab === 'recurring' && (
                        <div className="p-4 animate-in fade-in space-y-4">
                            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">{['all', 'Daniel', 'Gedalya'].map(t => <button key={t} onClick={() => setRecurringTab(t)} aria-label={`Filtrar por ${t}`} title={`Filtrar por ${t}`} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border ${recurringTab === t ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}>{t === 'all' ? 'Todos' : t}</button>)}</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800"><div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1"><ArrowUpCircle size={16} /> <span className="text-xs font-bold uppercase">Ingresos</span></div><div className="text-xl font-black text-slate-800 dark:text-white">${recStats.totalIncome.toFixed(2)}</div></div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800"><div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1"><ArrowDownCircle size={16} /> <span className="text-xs font-bold uppercase">Fijos</span></div><div className="text-xl font-black text-slate-800 dark:text-white">${recStats.totalExpense.toFixed(2)}</div></div>
                            </div>
                            {recurringTab !== 'all' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center"><div><div className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Disponible (Teórico)</div><div className="text-lg font-bold text-slate-800 dark:text-white">${(recStats.totalIncome - recStats.totalExpense).toFixed(2)}</div></div><div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200"><Wallet size={20} /></div></div>
                            )}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-slate-400 uppercase">Detalle</h3><button onClick={openNewRecModal} aria-label="Agregar nuevo registro fijo" title="Agregar concepto fijo" className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">+ Agregar</button></div>
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                    {recList.map(r => (
                                        <div key={r.id} onClick={() => openEditRecModal(r)} className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <div className="flex items-center gap-3 flex-1 min-w-0"><div className={`p-2 rounded-lg flex-shrink-0 ${r.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{r.type === 'income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}</div><div className="truncate"><div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{r.name}</div><div className="text-[10px] text-slate-400">{r.owner}</div></div></div>
                                            <div className="flex items-center gap-3 flex-shrink-0"><span className="font-bold text-sm dark:text-white">${r.amount.toFixed(2)}</span><button onClick={(e) => handleDeleteRecurring(r.id, e)} aria-label="Eliminar recurrente" title="Eliminar" className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50"><Trash2 size={14} /></button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INPUT */}
                    {activeTab === 'input' && (
                        <div className="p-5 space-y-5 animate-in slide-in-from-right-10 h-full flex flex-col">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2">Monto (TC)</span><div className="flex justify-center items-center mb-2 text-slate-800 dark:text-white"><span className="text-4xl text-slate-300 font-light mr-1">$</span><input type="number" aria-label="Ingresar monto" title="Monto de la transacción" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-6xl font-bold bg-transparent w-full text-center outline-none placeholder:text-slate-100 dark:placeholder:text-slate-800" autoFocus /></div></div>
                            <div className="flex-1 space-y-3">
                                <div className="overflow-x-auto pb-2 no-scrollbar"><div className="flex gap-3">{categories.map(cat => (<button key={cat.id} onClick={() => { setSelectedCat(cat); setSubCat(''); }} aria-label={`Seleccionar categoría ${cat.name}`} title={`Categoría ${cat.name}`} className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-xl border-2 transition-all ${selectedCat?.id === cat.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 opacity-100' : 'border-transparent bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'}`}><div className={`p-2 rounded-full ${selectedCat?.id === cat.id ? 'text-blue-600' : 'text-slate-500'}`}>{ICON_LIB[cat.iconKey]}</div><span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight truncate w-full">{cat.name}</span></button>))}</div></div>
                                {selectedCat && (<div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in"><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Detalle</label><div className="flex flex-wrap gap-2">{selectedCat.subs.map(sub => (<button key={sub} onClick={() => setSubCat(sub)} aria-label={`Subcategoría ${sub}`} title={`Subcategoría: ${sub}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${subCat === sub ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700'}`}>{sub}</button>))}</div></div>)}
                                <div className="flex gap-2 pt-2"><input type="date" aria-label="Fecha de transacción" title="Fecha" value={date} onChange={e => setDate(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none w-1/3 text-center" /><input type="text" aria-label="Descripción o nota" title="Descripción" placeholder="Nota..." value={notes} onChange={e => setNotes(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none dark:text-white" /></div>
                            </div>
                            <button onClick={handleAddTransaction} disabled={!amount || !selectedCat || !subCat} aria-label="Guardar movimiento" title="Guardar transacción" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50">GUARDAR</button>
                        </div>
                    )}

                    {/* LIST & CONCILE */}
                    {activeTab === 'list' && (
                        <div className="animate-in fade-in space-y-4 p-4">
                            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl font-bold text-xs"><button onClick={() => setListMode('table')} aria-label="Ver movimientos" title="Lista de movimientos" className={`flex-1 py-2 rounded-lg ${listMode === 'table' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'}`}>Movimientos</button><button onClick={() => setListMode('reconcile')} aria-label="Conciliar consumos" title="Módulo de conciliación" className={`flex-1 py-2 rounded-lg ${listMode === 'reconcile' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'}`}>Conciliar</button></div>
                            {listMode === 'table' && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.length === 0 && <div className="p-8 text-center text-xs text-slate-400">Sin registros</div>}
                                    {transactions.map((tx) => {
                                        const cat = categories.find(c => c.name === tx.category);
                                        return (
                                            <div key={tx.id} onClick={() => setEditingTx(tx)} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group">
                                                <div className="flex items-center gap-3 flex-1 min-w-0"><div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${cat?.color || 'bg-slate-100 text-slate-500'}`}>{ICON_LIB[cat?.iconKey]}</div><div className="truncate"><div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{tx.sub}</div><div className="text-[10px] text-slate-500 truncate">{tx.category} • {tx.date}</div></div></div>
                                                <div className="text-right flex-shrink-0 ml-2"><div className="font-bold text-sm text-slate-800 dark:text-white">${tx.amount.toFixed(2)}</div>{tx.isPaid && <span className="text-[9px] text-green-500 font-bold flex items-center justify-end gap-1"><CheckCircle2 size={10} /> Pagado</span>}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {listMode === 'reconcile' && (
                                <div className="space-y-4">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 flex gap-2"><AlertCircle size={16} /><span>Marca lo pagado a la Tarjeta.</span></div>
                                    {Array.from(new Set(transactions.map(t => t.week))).sort().reverse().map(week => (
                                        <div key={week} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 flex justify-between border-b border-slate-100 dark:border-slate-800"><span className="text-xs font-bold text-slate-500 uppercase">Semana {week}</span></div>
                                            {transactions.filter(t => t.week === week).map(tx => (
                                                <div key={tx.id} onClick={() => togglePaid(tx.id)} className="p-3 flex justify-between items-center cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0"><div className="flex items-center gap-3 flex-1 min-w-0">{tx.isPaid ? <CheckCircle2 size={20} className="text-green-500 fill-green-100 dark:fill-green-900/30 flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0"></div>}<div className="truncate"><div className={`text-xs font-bold truncate ${tx.isPaid ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{tx.sub}</div><div className="text-[9px] text-slate-400 truncate">{tx.category}</div></div></div><span className={`text-xs font-bold flex-shrink-0 ml-2 ${tx.isPaid ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>${tx.amount.toFixed(2)}</span></div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="p-4 animate-in slide-in-from-right-10 space-y-6">
                            <h2 className="font-bold text-lg dark:text-white px-2 mb-4">Ajustes</h2>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                {categories.map(cat => (
                                    <div key={cat.id} className="p-4">
                                        <div className="flex items-center gap-3 mb-2"><div className={`p-2 rounded-lg ${cat.color.split(' ')[0]} ${cat.color.split(' ')[1]}`}>{ICON_LIB[cat.iconKey]}</div><div className="flex-1 font-bold text-sm dark:text-white">{cat.name}</div><button onClick={() => setEditingCategory(cat)} aria-label={`Cambiar icono de ${cat.name}`} title="Cambiar icono" className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500"><Edit3 size={14} /></button></div>
                                        <div className="flex flex-wrap gap-1 ml-11">{cat.subs.map(sub => <span key={sub} className="text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">{sub}</span>)}<button onClick={() => addSubcategory(cat.id)} aria-label="Agregar subcategoría" title="Agregar concepto" className="text-[9px] border border-dashed border-slate-300 text-slate-400 px-2 py-1 rounded">+ Nuevo</button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </main>

                {/* --- NAVBAR FIX: flex-none --- */}
                <nav className="flex-none bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-6 pt-2 flex justify-around items-center z-30">
                    <button onClick={() => setActiveTab('dashboard')} aria-label="Ir a Inicio" title="Panel principal" className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><PieChart size={24} /><span className="text-[10px] font-bold mt-1">Inicio</span></button>
                    <button onClick={() => setActiveTab('recurring')} aria-label="Ir a Gastos Fijos" title="Gastos e ingresos fijos" className={`flex flex-col items-center p-2 ${activeTab === 'recurring' ? 'text-blue-600' : 'text-slate-400'}`}><Repeat size={24} /><span className="text-[10px] font-bold mt-1">Fijos</span></button>
                    <button onClick={() => setActiveTab('input')} aria-label="Agregar nuevo gasto" title="Ingresar gasto" className={`flex flex-col items-center p-2 ${activeTab === 'input' ? 'text-blue-600' : 'text-slate-400'}`}><Plus size={32} className="bg-blue-600 text-white rounded-full p-1.5 shadow-lg" /></button>
                    <button onClick={() => setActiveTab('list')} aria-label="Ir a Movimientos" title="Histórico de movimientos" className={`flex flex-col items-center p-2 ${activeTab === 'list' ? 'text-blue-600' : 'text-slate-400'}`}><ListTodo size={24} /><span className="text-[10px] font-bold mt-1">Movs.</span></button>
                    <button onClick={() => setActiveTab('settings')} aria-label="Ajustes" title="Configuración" className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}><Settings size={24} /><span className="text-[10px] font-bold mt-1">Ajustes</span></button>
                </nav>

                {/* MODALS RENDER */}
                {showRecModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="font-bold text-lg dark:text-white">{editingRecurring ? 'Editar' : 'Nuevo'} Recurrente</h3>
                            <div className="flex gap-2"><button onClick={() => setRecType('income')} aria-label="Cambiar a tipo ingreso" title="Marcar como ingreso" className={`flex-1 py-2 rounded-lg text-xs font-bold border ${recType === 'income' ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>Ingreso</button><button onClick={() => setRecType('expense')} aria-label="Cambiar a tipo gasto" title="Marcar como gasto" className={`flex-1 py-2 rounded-lg text-xs font-bold border ${recType === 'expense' ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}>Gasto</button></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block" htmlFor="rec-name">Concepto</label><input id="rec-name" type="text" aria-label="Concepto" title="Nombre del concepto" value={recName} onChange={e => setRecName(e.target.value)} placeholder="Ej: Salario" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white" /></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block" htmlFor="rec-amount">Monto</label><input id="rec-amount" type="number" aria-label="Monto" title="Cantidad económica" value={recAmount} onChange={e => setRecAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white" /></div>
                            <div className="flex gap-2">{OWNERS.map(o => <button key={o} onClick={() => setRecOwner(o)} aria-label={`Asignar registro a ${o}`} title={`Responsable: ${o}`} className={`flex-1 py-2 rounded-lg text-xs border ${recOwner === o ? 'bg-blue-50 border-blue-500 text-blue-600' : 'text-slate-400'}`}>{o}</button>)}</div>
                            <button onClick={handleSaveRecurring} aria-label="Guardar registro fijo" title="Confirmar y guardar" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Guardar</button>
                            <button onClick={() => setShowRecModal(false)} aria-label="Cancelar cambios" title="Cerrar modal" className="w-full py-2 text-slate-400 text-xs">Cancelar</button>
                        </div>
                    </div>
                )}
                {showBulkModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full sm:w-[90%] rounded-t-3xl sm:rounded-3xl p-6 h-[85vh] sm:h-auto flex flex-col animate-in slide-in-from-bottom-10">
                            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><UploadCloud className="text-blue-500" /> Importador IA</h2><button onClick={() => setShowBulkModal(false)} aria-label="Cerrar importador" title="Cerrar ventana"><X className="dark:text-white" /></button></div>
                            <div className="flex-1 overflow-y-auto space-y-4"><div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800"><div className="flex justify-between items-start mb-2"><label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">1. Prompt</label><button onClick={copyPrompt} aria-label="Copiar prompt IA" title="Copiar al portapapeles" className={`text-xs px-2 py-1 rounded font-bold ${isCopied ? 'bg-green-500 text-white' : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700'}`}>{isCopied ? '¡Copiado!' : 'Copiar'}</button></div><p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 p-2 bg-white dark:bg-slate-950 rounded border border-indigo-100 dark:border-indigo-900/50">{AI_PROMPT}</p></div><div><label htmlFor="csv-input" className="text-xs font-bold text-slate-400 uppercase mb-2 block">2. Pegar CSV</label><textarea id="csv-input" value={csvText} onChange={(e) => setCsvText(e.target.value)} title="Entrada de datos CSV" className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono dark:text-white" placeholder="Pegar aquí..."></textarea></div><button onClick={handleBulkImport} aria-label="Procesar datos pegados" title="Ejecutar importación" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl">Procesar</button></div>
                        </div>
                    </div>
                )}
                {editingTx && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="font-bold text-lg dark:text-white">Editar Movimiento</h3>
                            <div><label className="text-xs text-slate-400 uppercase font-bold" htmlFor="edit-amount">Monto</label><input id="edit-amount" type="number" aria-label="Monto" title="Editar monto" value={editingTx.amount} onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white mt-1" /></div>
                            <div><label className="text-xs text-slate-400 uppercase font-bold">Categoría</label><div className="flex gap-2 mt-1"><select aria-label="Seleccionar categoría" title="Categoría principal" value={editingTx.category} onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })} className="w-1/2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white text-xs">{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select><input type="text" aria-label="Editar subcategoría" title="Subcategoría" value={editingTx.sub} onChange={(e) => setEditingTx({ ...editingTx, sub: e.target.value })} className="w-1/2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white text-xs" /></div></div>
                            <div><label className="text-xs text-slate-400 uppercase font-bold" htmlFor="edit-note">Nota</label><input id="edit-note" type="text" aria-label="Nota" title="Nota adicional" value={editingTx.notes} onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white mt-1" /></div>
                            <div className="flex gap-3 pt-2"><button onClick={() => handleDelete(editingTx.id)} aria-label="Eliminar este movimiento" title="Borrar permanentemente" className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold flex justify-center items-center gap-2"><Trash2 size={18} /> Borrar</button><button onClick={handleUpdate} aria-label="Actualizar movimiento" title="Guardar cambios realizados" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Guardar</button></div>
                            <button onClick={() => setEditingTx(null)} aria-label="Cancelar edición" title="Volver sin guardar" className="w-full py-2 text-slate-400 text-xs">Cancelar</button>
                        </div>
                    </div>
                )}
                {editingCategory && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full rounded-3xl p-6 shadow-2xl h-3/4 flex flex-col">
                            <h3 className="font-bold text-lg dark:text-white mb-4">Icono para {editingCategory.name}</h3>

                            <div className="grid grid-cols-5 gap-3 overflow-y-auto p-2 flex-1">{Object.entries(ICON_LIB).map(([key, component]: [string, any]) => (<button key={key} onClick={() => saveCategoryEdit(key)} aria-label={`Seleccionar icono ${key}`} title={`Icono: ${key}`} className={`p-3 rounded-xl flex items-center justify-center transition-colors aspect-square ${editingCategory.iconKey === key ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{component}</button>))}</div>
                            <button onClick={() => setEditingCategory(null)} aria-label="Cerrar selector de iconos" title="Cerrar ventana" className="w-full mt-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl">Cancelar</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};