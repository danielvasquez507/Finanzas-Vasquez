"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Sun, Moon,
    CheckCircle2, ShoppingCart, Zap, Car, Heart, Hammer, CreditCard, Plane, MoreHorizontal,
    UploadCloud, X, Grid, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
    Briefcase, Coffee, Gift, Home, Smartphone, Music, BookOpen, Utensils,
    Dumbbell, Dog, GraduationCap, Wifi, Droplets, Tv, Gamepad2, Shirt,
    Scissors, Stethoscope, Pill, Bus, Fuel, Wrench, Baby, Trash2, Wallet, AlertCircle, PlusCircle,
    Repeat, ArrowDownCircle, ArrowUpCircle, UserCircle2, Users, Pencil,
    Landmark, PiggyBank, Banknote, Coins, Receipt, Ticket, Clapperboard,
    Flower2, Trees, Palmtree, Mountain, Tent, Sofa, Bed, Bath, ShowerHead,
    Lightbulb, Plug, Package, Cat, Monitor, BarChart3, ListTodo, Settings, Edit3, PieChart, Phone,
    Camera, Watch, Headphones, Speaker, Tablet, Printer, Battery,
    Archive, Book, Bookmark, Calendar, Cloud, Code, Compass, Database, Flag, Folder,
    Globe, Image, Key, Link, Lock, Mail, Map, MapPin, MessageCircle, Mic,
    Moon as MoonIcon, Mouse, Paperclip, Pen, Play, Power, Radio, Search, Send,
    Server, Shield, Star, Sun as SunIcon, Tag, Terminal, Truck, Umbrella, Video, Voicemail,
    User, HeartHandshake, Accessibility, Syringe, Thermometer,
    HardHat, Shovel, Ruler, Paintbrush, ShieldCheck, UserCog, UserCheck, Users2, Sparkles
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
    const diff = d.getDate() - day; // Start week on Sunday
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(new Date(start).setDate(start.getDate() + 6));
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const formatDateRange = (start: Date, end: Date) => {
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    // Since we work with midnight-local dates in the frontend:
    const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]}`;
    return `${fmt(start)} - ${fmt(end)}`;
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
    // New Icons
    'camera': <Camera size={20} />, 'watch': <Watch size={20} />, 'headphones': <Headphones size={20} />, 'speaker': <Speaker size={20} />,
    'tablet': <Tablet size={20} />, 'printer': <Printer size={20} />, 'battery': <Battery size={20} />, 'archive': <Archive size={20} />,
    'bookmark': <Bookmark size={20} />, 'calendar': <Calendar size={20} />, 'cloud': <Cloud size={20} />, 'code': <Code size={20} />,
    'compass': <Compass size={20} />, 'database': <Database size={20} />, 'flag': <Flag size={20} />, 'folder': <Folder size={20} />,
    'globe': <Globe size={20} />, 'image': <Image size={20} />, 'key': <Key size={20} />, 'link': <Link size={20} />, 'lock': <Lock size={20} />,
    'mail': <Mail size={20} />, 'map': <Map size={20} />, 'map-pin': <MapPin size={20} />, 'message': <MessageCircle size={20} />,
    'mic': <Mic size={20} />, 'mouse': <Mouse size={20} />, 'paperclip': <Paperclip size={20} />, 'pen': <Pen size={20} />,
    'play': <Play size={20} />, 'power': <Power size={20} />, 'radio': <Radio size={20} />, 'search': <Search size={20} />,
    'send': <Send size={20} />, 'server': <Server size={20} />, 'shield': <Shield size={20} />, 'star': <Star size={20} />,
    'tag': <Tag size={20} />, 'terminal': <Terminal size={20} />, 'truck': <Truck size={20} />, // Removed Tool
    'umbrella': <Umbrella size={20} />, 'video': <Video size={20} />, 'voicemail': <Voicemail size={20} />,
    // Requested Specifics
    'user': <User size={20} />, 'lady': <UserCircle2 size={20} />, 'family': <Users2 size={20} />, 'handshake': <HeartHandshake size={20} />, 'accessibility': <Accessibility size={20} />,
    'services': <Sparkles size={20} />, 'syringe': <Syringe size={20} />, 'thermometer': <Thermometer size={20} />,
    'hardhat': <HardHat size={20} />, 'shovel': <Shovel size={20} />, 'ruler': <Ruler size={20} />, 'paintbrush': <Paintbrush size={20} />,
    'shield-check': <ShieldCheck size={20} />, 'user-cog': <UserCog size={20} />, 'user-check': <UserCheck size={20} />
};

const COLORS_LIB = [
    // Vibrant Palette
    'bg-blue-600 text-white', 'bg-blue-500 text-white', 'bg-blue-400 text-white',
    'bg-indigo-600 text-white', 'bg-indigo-500 text-white', 'bg-violet-600 text-white',
    'bg-purple-600 text-white', 'bg-purple-500 text-white', 'bg-fuchsia-600 text-white',
    'bg-pink-600 text-white', 'bg-rose-600 text-white', 'bg-rose-500 text-white',
    'bg-red-600 text-white', 'bg-red-500 text-white', 'bg-orange-600 text-white',
    'bg-orange-500 text-white', 'bg-amber-500 text-white', 'bg-yellow-500 text-white',
    'bg-lime-600 text-white', 'bg-green-600 text-white', 'bg-green-500 text-white',
    'bg-emerald-600 text-white', 'bg-teal-600 text-white', 'bg-teal-500 text-white',
    'bg-cyan-600 text-white', 'bg-sky-600 text-white', 'bg-slate-800 text-white',
    'bg-slate-600 text-white', 'bg-zinc-700 text-white', 'bg-stone-600 text-white',
    // Pastel/Light Options (Classic)
    'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700',
    'bg-yellow-100 text-yellow-700', 'bg-slate-100 text-slate-700'
];

const OWNERS = ['Daniel', 'Gedalya', 'Ambos'];

const AI_PROMPT = `Actúa como contador. Analiza la imagen. Genera CSV: date,category,subcategory,amount,notes.
Reglas:
- date: YYYY-MM-DD
- category: Personal Daniel, Personal Gedalya, Personal Ambos, Supermercado, Servicios, Automóvil, Salud, Tarjeta Crédito.
- subcategory: Nombre del comercio.
- amount: Decimales.
Devuelve SOLO el bloque CSV.`;
// --- CALENDAR COMPONENT ---
const DatePicker = ({ value, onChange, onClose }: { value: string, onChange: (date: string) => void, onClose: () => void }) => {
    // Initial view neutralizing TZ to ensure YYYY-MM-DD shows the correct local month
    const [viewDate, setViewDate] = useState(() => {
        if (!value) return new Date();
        const d = new Date(value);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d;
    });
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronLeft size={20} className="text-slate-500" /></button>
                <span className="text-lg font-bold text-slate-800 dark:text-white capitalize">{monthNames[month]} {year}</span>
                <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronRight size={20} className="text-slate-500" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <span key={d} className="text-xs font-bold text-slate-400 py-2">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    // Format YYYY-MM-DD manually to avoid TZ shifts
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                    const isSelected = value === dateStr;
                    return (
                        <button
                            key={d}
                            onClick={() => { onChange(dateStr); onClose(); }}
                            className={`w-full aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all active:scale-95 ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>
            <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
        </div>
    );
};

// ... constants ...
const getWeekString = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    return `W${weekNum}`;
};

const mapApiToLocal = (tx: any): Transaction => {
    const d = tx.date ? new Date(tx.date) : new Date();
    // Neutralize TZ from database (UTC) to local
    const localDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return { ...tx, date: localDate.toISOString().split('T')[0] };
};

const TxItem = ({ tx, cat, onClick }: { tx: Transaction, cat: any, onClick: () => void }) => (
    <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all ${cat?.color || 'bg-slate-100 text-slate-500'} ${tx.isPaid ? 'grayscale opacity-40 scale-90' : 'shadow-sm'}`}>
                {ICON_LIB[cat?.iconKey]}
            </div>
            <div className="truncate">
                <div className={`text-xs font-bold truncate transition-all ${tx.isPaid ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {tx.sub}
                </div>
                <div className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-tighter">
                    {tx.date}
                </div>
            </div>
        </div>
        <div className="text-right min-w-[70px]">
            <div className={`font-mono font-bold text-sm transition-all ${tx.isPaid ? 'text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                ${tx.amount.toFixed(2)}
            </div>
        </div>
    </div>
);

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

import Head from 'next/head';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(true);

    // Filtros de Tiempo
    const [dashFilter, setDashFilter] = useState('week');
    const [viewDate, setViewDate] = useState(new Date());

    // Filtro de Pantalla Movimientos
    const [listGroupMode, setListGroupMode] = useState<'week' | 'category'>('week');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    // Filtro de Recurrentes (Fijos)
    const [recurringTab, setRecurringTab] = useState('all');

    // Datos Globales
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recurring, setRecurring] = useState<RecurringItem[]>([]);

    // Custom UI State
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, msg: string, onConfirm: () => void } | null>(null);
    const [inputModal, setInputModal] = useState<{ open: boolean, title: string, placeholder: string, value: string, catId: string } | null>(null);
    const [showListHelp, setShowListHelp] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [settingsTab, setSettingsTab] = useState<'menu' | 'themes' | 'import' | 'categories'>('menu');

    useEffect(() => {
        const timer = setTimeout(() => setShowHeader(false), 30000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (activeTab === 'list') {
            setShowListHelp(true);
            const timer = setTimeout(() => setShowListHelp(false), 30000);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);


    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

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

    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [calendarModal, setCalendarModal] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState<'new' | 'edit'>('new');
    const [optionPicker, setOptionPicker] = useState<{ title: string, options: string[], onSelect: (val: string) => void } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setExpandedGroups([]);
    }, [listGroupMode, activeTab]);

    // Detect Keyboard Open
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                // If viewport shrinks significantly (e.g., < 75% of window height), keyboard is likely open
                setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.75);
            }
        };

        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                // Check if it's meant to be typed in (not readonly/hidden)
                if (!target.hasAttribute('readonly') && target.getAttribute('type') !== 'hidden' && target.getAttribute('type') !== 'checkbox') {
                    setIsKeyboardOpen(true);
                }
            }
        };

        const handleBlur = () => {
            // Small delay to check if focus moved to another input
            setTimeout(() => {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    setIsKeyboardOpen(false);
                }
            }, 100);
        };

        window.visualViewport?.addEventListener('resize', handleResize);
        window.addEventListener('focusin', handleFocus); // Capture bubbling focus
        window.addEventListener('focusout', handleBlur);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.removeEventListener('focusin', handleFocus);
            window.removeEventListener('focusout', handleBlur);
        };
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
    const [editAmountStr, setEditAmountStr] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (editingTx) {
            const val = editingTx.amount;
            setEditAmountStr(val % 1 === 0 ? val.toString() : val.toFixed(2));
        }
    }, [editingTx?.id]);


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
    const handleSave = async () => {
        if (!amount || !selectedCat) { // Changed 'category' to 'selectedCat' to match existing state
            showToast("Faltan datos", 'error');
            return;
        }

        const dateObj = safeDate(date);
        const amt = parseFloat(amount);
        const week = getWeekRange(dateObj); // Calculate week for saving

        const payload = {
            date: dateObj,
            category: selectedCat.name, // Used selectedCat.name
            sub: subCat, // Used subCat
            amount: amt,
            notes,
            isPaid: false, // Changed to false as per user request
            week: formatDateRange(week.start, week.end)
        };

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const saved = await res.json();
                setTransactions([mapApiToLocal(saved), ...transactions]);
                setAmount('');
                setSubCat('');
                setNotes('');
                showToast("Gasto agregado", 'success');
            } else {
                showToast("Error al guardar", 'error');
            }
        } catch (e) {
            showToast("Error de conexión", 'error');
        }
    };

    const handleDelete = async (id: number) => {
        setConfirmModal({
            open: true,
            msg: "¿Seguro que quieres borrar este gasto?",
            onConfirm: async () => {
                await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
                setTransactions(transactions.filter(t => t.id !== id));
                showToast("Gasto eliminado", 'success');
                setConfirmModal(null);
                setEditingTx(null);
            }
        });
    };

    const toggleGroupPaid = async (targetState: boolean, filters: { week?: string, category?: string }) => {
        const txsToUpdate = transactions.filter(t => {
            const matchesWeek = filters.week ? t.week === filters.week : true;
            const matchesCat = filters.category ? t.category === filters.category : true;
            return matchesWeek && matchesCat && t.isPaid !== targetState;
        });

        if (txsToUpdate.length === 0) return;

        try {
            const results = await Promise.all(txsToUpdate.map(tx =>
                fetch(`/api/transactions?id=${tx.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...tx, isPaid: targetState })
                }).then(r => r.ok ? r.json() : null)
            ));

            const updatedIds = results.filter(r => r !== null).map(r => r.id);
            setTransactions(transactions.map(t => updatedIds.includes(t.id) ? { ...t, isPaid: targetState } : t));
        } catch (e) {
            console.error(e);
            showToast("Error al actualizar grupo", 'error');
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
                showToast("Gasto actualizado", 'success');
            }
        } catch (e) {
            console.error(e);
            showToast("Error de conexión", 'error');
        }
    };

    const togglePaid = async (id: number) => {
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        const newVal = !tx.isPaid;
        // Optimistic update
        setTransactions(transactions.map(t => t.id === id ? { ...t, isPaid: newVal } : t));
        showToast(newVal ? "Marcado como pagado" : "Marcado como pendiente", 'info');

        try {
            await fetch(`/api/transactions?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...tx, isPaid: newVal })
            });
        } catch (e) {
            showToast("Error de sincronización", 'error');
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
                showToast("Recurrente actualizado", 'success');
            } else {
                const res = await fetch('/api/recurring', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
                const saved = await res.json();
                setRecurring([...recurring, saved]);
                showToast("Recurrente creado", 'success');
            }
            setShowRecModal(false); setRecName(''); setRecAmount(''); setEditingRecurring(null);
        } catch (e) {
            showToast("Error guardando recurrente", 'error');
        }
    };

    const handleDeleteRecurring = async (id: number, e: any) => {
        e.stopPropagation();
        setConfirmModal({
            open: true,
            msg: "¿Eliminar este registro fijo?",
            onConfirm: async () => {
                await fetch(`/api/recurring?id=${id}`, { method: 'DELETE' });
                setRecurring(recurring.filter(r => r.id !== id));
                if (editingRecurring?.id === id) setShowRecModal(false);
                showToast("Recurrente eliminado", 'success');
                setConfirmModal(null);
            }
        });
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
            showToast(`Importación: ${newTxs.length} éxitos, ${errorCount} errores.`, 'success');
        } else {
            showToast("Error en importación.", 'error');
        }

        setShowBulkModal(false);
        setCsvText('');
        setActiveTab('list');
    };

    const saveCategoryEdit = async (catData: Category) => {
        const isNew = !catData.id;

        // Validation: Duplicate Name
        const duplicate = categories.find(c =>
            c.name.trim().toLowerCase() === catData.name.trim().toLowerCase() &&
            c.id !== catData.id
        );

        if (duplicate) {
            showToast("Ya existe una categoría con ese nombre", 'error');
            return;
        }

        const method = isNew ? 'POST' : 'PUT';

        const res = await fetch('/api/categories', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(catData)
        });

        if (res.ok) {
            const saved = await res.json();
            if (isNew) {
                setCategories([...categories, saved]);
                showToast("Categoría creada", 'success');
            } else {
                setCategories(categories.map(c => c.id === saved.id ? saved : c));
                showToast("Categoría actualizada", 'success');
            }
            setEditingCategory(null); // Close modal
        } else {
            showToast("Error al guardar categoría", 'error');
        }
    };

    const handleDeleteCategory = (id: string) => {
        setConfirmModal({
            open: true,
            msg: "¿Seguro que quieres borrar esta categoría y todo su contenido?",
            onConfirm: async () => {
                await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
                setCategories(categories.filter(c => c.id !== id));
                showToast("Categoría eliminada", 'success');
                setConfirmModal(null);
            }
        });
    };

    const submitSubcategory = async () => {
        if (!inputModal || !inputModal.value.trim()) return;

        await handleAddSubcategory(inputModal.catId, inputModal.value);
        setInputModal(null);
    };

    const handleAddSubcategory = async (catId: string, newSub: string) => {
        if (!newSub.trim()) return;
        const cat = categories.find(c => c.id === catId);
        if (!cat) return;

        // Validation: Duplicate Subcategory
        const exists = cat.subs.some(s => s.trim().toLowerCase() === newSub.trim().toLowerCase());
        if (exists) {
            showToast("Esa subcategoría ya existe", 'error');
            return;
        }

        const newSubs = [...cat.subs, newSub.trim()];

        await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...cat, subs: newSubs })
        });

        setCategories(categories.map(c => c.id === catId ? { ...c, subs: newSubs } : c));
        showToast("Subcategoría agregada", 'success');
    };

    const handleDeleteSubcategory = (catId: string, subToDelete: string) => {
        setConfirmModal({
            open: true,
            msg: `¿Borrar subcategoría "${subToDelete}"?`,
            onConfirm: async () => {
                const cat = categories.find(c => c.id === catId);
                if (!cat) return;
                const newSubs = cat.subs.filter(s => s !== subToDelete);

                await fetch('/api/categories', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...cat, subs: newSubs })
                });

                setCategories(categories.map(c => c.id === catId ? { ...c, subs: newSubs } : c));
                showToast("Subcategoría eliminada", 'info');
                setConfirmModal(null);
            }
        });
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
        <div className={`h-[100dvh] w-full flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
            <Head>
                <title>Finanzas Vásquez</title>
                <meta name="description" content="Control de gastos familiares" />
                <link rel="icon" href="/logo.svg" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
            </Head>

            {/* Container para Desktop (Full Width) */}
            <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 shadow-2xl overflow-hidden relative">


                {/* --- HEADER --- */}
                <header className={`flex-none px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition-all duration-700 overflow-hidden z-20 ${showHeader ? 'h-14 opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.svg" alt="Logo" className="h-8 w-auto cursor-pointer" onClick={() => setShowHeader(true)} />
                            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hidden sm:block">
                                Finanzas Vásquez
                            </h1>
                        </div>
                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Inicio</button>
                            <button onClick={() => setActiveTab('recurring')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'recurring' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Fijos</button>
                            <button onClick={() => setActiveTab('input')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'input' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Ingresar</button>
                            <button onClick={() => setActiveTab('list')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Movimientos</button>
                            <button onClick={() => { setActiveTab('settings'); setSettingsTab('menu'); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Ajustes</button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowBulkModal(true)} aria-label="Importar con IA" title="Importar con IA" className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"><UploadCloud size={18} /></button>
                        <button onClick={() => setDarkMode(!darkMode)} aria-label="Cambiar tema" title="Cambiar tema" className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                    </div>
                </header>

                {/* Botón discreto para recuperar el header si está oculto */}
                {!showHeader && (
                    <div className="absolute top-0 inset-x-0 h-1 z-30 cursor-pointer group" onClick={() => setShowHeader(true)}>
                        <div className="mx-auto w-12 h-1 bg-slate-300/20 rounded-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                )}

                {/* --- MAIN CONTENT SCROLLABLE --- */}
                <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50 dark:bg-slate-950/50">
                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="pt-4 px-4 pb-6 space-y-6 animate-in fade-in">
                            <div className="flex flex-col gap-3">
                                <div className="bg-slate-200 dark:bg-slate-800 rounded-full flex font-bold text-xs relative overflow-hidden">{['week', 'month', 'year'].map(filter => (<button key={filter} onClick={() => { setDashFilter(filter); setViewDate(new Date()); }} aria-label={`Filtrar por ${filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}`} title={`Ver por ${filter === 'week' ? 'semana' : filter === 'month' ? 'mes' : 'año'}`} className={`flex-1 py-2.5 transition-all capitalize ${dashFilter === filter ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}>{filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}</button>))}</div>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800"><button onClick={() => navigateTime(-1)} aria-label="Anterior" title="Anterior" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ChevronLeft size={20} /></button><span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{getTimeLabel()}</span><button onClick={() => navigateTime(1)} aria-label="Siguiente" title="Siguiente" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ChevronRight size={20} /></button></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center h-full">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Total Gastado (TC)</span>
                                    <div className="text-5xl font-black text-slate-800 dark:text-white">${getChartData().totalSum.toFixed(2)}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-2">
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-blue-500" /> Desglose por Categoría</h3>
                                    <BarChart data={getChartData().sorted} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FIJOS (RECURRENTES) */}
                    {activeTab === 'recurring' && (
                        <div className="pt-4 px-4 pb-24 animate-in fade-in space-y-6 max-w-none mx-auto">
                            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar justify-center md:justify-start">{['all', 'Daniel', 'Gedalya'].map(t => <button key={t} onClick={() => setRecurringTab(t)} aria-label={`Filtrar por ${t}`} title={`Filtrar por ${t}`} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${recurringTab === t ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}>{t === 'all' ? 'Todos' : t}</button>)}</div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800"><div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1"><ArrowUpCircle size={16} /> <span className="text-xs font-bold uppercase">Ingresos</span></div><div className="text-2xl font-black text-slate-800 dark:text-white">${recStats.totalIncome.toFixed(2)}</div></div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800"><div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1"><ArrowDownCircle size={16} /> <span className="text-xs font-bold uppercase">Fijos</span></div><div className="text-2xl font-black text-slate-800 dark:text-white">${recStats.totalExpense.toFixed(2)}</div></div>
                                {recurringTab !== 'all' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center col-span-1 sm:col-span-2 lg:col-span-1"><div><div className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Disponible (Teórico)</div><div className="text-xl font-bold text-slate-800 dark:text-white">${(recStats.totalIncome - recStats.totalExpense).toFixed(2)}</div></div><div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200"><Wallet size={20} /></div></div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Detalle</h3><button onClick={openNewRecModal} aria-label="Agregar nuevo registro fijo" title="Agregar concepto fijo" className="text-xs bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full font-bold hover:bg-blue-200 transition-colors">+ Agregar</button></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {recList.map(r => (
                                        <div key={r.id} onClick={() => openEditRecModal(r)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-800">
                                            <div className="flex items-center gap-3 flex-1 min-w-0"><div className={`p-2 rounded-lg flex-shrink-0 ${r.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{r.type === 'income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}</div><div className="truncate"><div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{r.name}</div><div className="text-[10px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">{r.owner}</div></div></div>
                                            <div className="flex flex-col items-end gap-1"><span className="font-black text-lg dark:text-white">${r.amount.toFixed(2)}</span><button onClick={(e) => handleDeleteRecurring(r.id, e)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INPUT */}
                    {activeTab === 'input' && (
                        <div className="pt-4 px-4 pb-5 space-y-5 animate-in slide-in-from-right-10 h-full flex flex-col">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2">Monto (TC)</span>
                                <div className="flex justify-center items-center mb-2 text-slate-800 dark:text-white">
                                    <span className="text-4xl text-slate-300 font-light mr-1">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        aria-label="Ingresar monto"
                                        title="Monto de la transacción"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        onBlur={() => {
                                            if (amount) {
                                                const val = parseFloat(amount);
                                                if (!isNaN(val)) setAmount(val % 1 === 0 ? val.toString() : val.toFixed(2));
                                            }
                                        }}
                                        className="text-6xl font-bold bg-transparent w-full text-center outline-none placeholder:text-slate-100 dark:placeholder:text-slate-800"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="overflow-x-auto pb-2 no-scrollbar"><div className="flex gap-3">{categories.map(cat => (<button key={cat.id} onClick={() => { setSelectedCat(cat); setSubCat(''); }} aria-label={`Seleccionar categoría ${cat.name}`} title={`Categoría ${cat.name}`} className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-2xl border-2 transition-all ${selectedCat?.id === cat.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 opacity-100' : 'border-transparent bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'}`}><div className={`p-2 rounded-full ${selectedCat?.id === cat.id ? 'text-blue-600' : 'text-slate-500'}`}>{ICON_LIB[cat.iconKey]}</div><span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight truncate w-full">{cat.name}</span></button>))}</div></div>
                                {selectedCat && (<div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 animate-in fade-in"><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Subcategoría</label><div className="flex flex-wrap gap-2">{selectedCat.subs.map(sub => (<button key={sub} onClick={() => setSubCat(sub)} aria-label={`Subcategoría ${sub}`} title={`Subcategoría: ${sub}`} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${subCat === sub ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700'}`}>{sub}</button>))}</div></div>)}
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => { setCalendarTarget('new'); setCalendarModal(true); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none w-1/3 text-center active:scale-95 transition-transform" aria-label="Cambiar fecha">
                                        {new Date(safeDate(date)).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </button>
                                    <input type="text" aria-label="Descripción o nota" title="Descripción" placeholder="Nota..." value={notes} onChange={e => setNotes(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-3 text-xs font-bold outline-none dark:text-white" />
                                </div>
                            </div>
                            <button onClick={handleSave} disabled={!amount || !selectedCat || !subCat} aria-label="Guardar movimiento" title="Guardar transacción" className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50">GUARDAR</button>
                        </div>
                    )}

                    {/* LIST & CONCILE UNIFIED */}
                    {activeTab === 'list' && (
                        <div className="animate-in fade-in space-y-4 pt-4 px-4 pb-24">


                            {showListHelp && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-[10px] text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 flex gap-2 items-center animate-in slide-in-from-top-2">
                                    <AlertCircle size={14} />
                                    <span>Toca el círculo para marcar como pagado. Toca el gasto para editar.</span>
                                </div>
                            )}

                            {transactions.length === 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="text-slate-300 mb-2"><ListTodo size={40} className="mx-auto opacity-20" /></div>
                                    <div className="text-xs text-slate-400 font-medium">No hay movimientos registrados</div>
                                </div>
                            )}

                            {Array.from(new Set(transactions.map(t => listGroupMode === 'week' ? t.week : t.category)))
                                .sort((a, b) => listGroupMode === 'week' ? b.localeCompare(a) : a.localeCompare(b))
                                .map(groupKey => {
                                    const groupTxs = transactions.filter(t => (listGroupMode === 'week' ? t.week : t.category) === groupKey);
                                    const groupTotal = groupTxs.reduce((acc, t) => acc + t.amount, 0);
                                    const catInfo = listGroupMode === 'category' ? categories.find(c => c.name === groupKey) : null;
                                    const isExpanded = expandedGroups.includes(groupKey);
                                    const allPaid = groupTxs.every(t => t.isPaid);

                                    return (
                                        <div key={groupKey} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
                                            <div className="flex items-center bg-slate-50 dark:bg-slate-800/50">
                                                <div
                                                    onClick={() => setExpandedGroups(prev => isExpanded ? prev.filter(k => k !== groupKey) : [...prev, groupKey])}
                                                    className="flex-1 p-3 flex justify-between items-center cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                                            <ChevronDown size={14} className="text-slate-400" />
                                                        </div>
                                                        {catInfo && <span className="text-blue-500 scale-75">{ICON_LIB[catInfo.iconKey]}</span>}
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{groupKey}</span>
                                                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 rounded-full">{groupTxs.length}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2">${groupTotal.toFixed(2)}</span>
                                                </div>
                                                {listGroupMode === 'category' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleGroupPaid(!allPaid, { category: groupKey }); }}
                                                        className={`w-12 h-12 flex items-center justify-center transition-all ${allPaid ? 'text-green-500' : 'text-slate-300'}`}
                                                    >
                                                        {allPaid ? <CheckCircle2 size={24} className="fill-green-100 dark:fill-green-900/30" /> : <div className="w-6 h-6 rounded-full border-2 border-current" />}
                                                    </button>
                                                )}
                                            </div>
                                            {isExpanded && (
                                                <div className="animate-in slide-in-from-top-2 duration-200 divide-y divide-slate-50 dark:divide-slate-800">
                                                    {listGroupMode === 'week' ? (
                                                        // Sub-group by category WITHIN week
                                                        Array.from(new Set(groupTxs.map(t => t.category))).sort().map(catName => {
                                                            const catTxs = groupTxs.filter(t => t.category === catName);
                                                            const catTotal = catTxs.reduce((acc, t) => acc + t.amount, 0);
                                                            const cInfo = categories.find(c => c.name === catName);
                                                            const catAllPaid = catTxs.every(t => t.isPaid);
                                                            return (
                                                                <div key={catName} className="bg-white dark:bg-slate-950/20">
                                                                    <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
                                                                        <div className="flex items-center gap-2">
                                                                            {cInfo && <span className="scale-75 opacity-70">{ICON_LIB[cInfo.iconKey]}</span>}
                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{catName}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">${catTotal.toFixed(2)}</span>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); toggleGroupPaid(!catAllPaid, { week: groupKey, category: catName }); }}
                                                                                className={`w-8 h-8 flex items-center justify-center transition-all ${catAllPaid ? 'text-green-500' : 'text-slate-300'}`}
                                                                            >
                                                                                {catAllPaid ? <CheckCircle2 size={18} className="fill-green-100 dark:fill-green-900/30" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="divide-y divide-slate-50 dark:divide-slate-900">
                                                                        {catTxs.map(tx => (
                                                                            <TxItem key={tx.id} tx={tx} cat={cInfo} onClick={() => setEditingTx(tx)} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        // Nested weeks within category (Original logic but with week param for toggleGroupPaid)
                                                        Array.from(new Set(groupTxs.map(t => t.week))).sort().reverse().map(subWeek => {
                                                            const subTxs = groupTxs.filter(t => t.week === subWeek);
                                                            const subTotal = subTxs.reduce((acc, t) => acc + t.amount, 0);
                                                            return (
                                                                <div key={subWeek} className="bg-white dark:bg-slate-950/20">
                                                                    <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{subWeek}</span>
                                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">${subTotal.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="divide-y divide-slate-50 dark:divide-slate-900">
                                                                        {subTxs.map(tx => (
                                                                            <TxItem key={tx.id} tx={tx} cat={catInfo} onClick={() => setEditingTx(tx)} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {/* SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="pt-4 px-4 pb-4 animate-in slide-in-from-right-10">
                            {settingsTab === 'menu' && (
                                <div className="grid grid-cols-1 gap-3">
                                    <button onClick={() => setSettingsTab('themes')} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                                                {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm dark:text-white">Temas</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{darkMode ? 'Oscuro' : 'Claro'}</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300" />
                                    </button>

                                    <button onClick={() => setShowBulkModal(true)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                                <UploadCloud size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm dark:text-white">Importar</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Cargar CSV con IA</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300" />
                                    </button>

                                    <button onClick={() => setSettingsTab('categories')} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                                <Grid size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm dark:text-white">Categorías</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Gestionar secciones y subcategorías</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300" />
                                    </button>
                                </div>
                            )}

                            {settingsTab === 'themes' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Tema</h3>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setDarkMode(false)}
                                            className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${!darkMode ? 'bg-white border-blue-500 shadow-xl' : 'bg-white/50 border-slate-100 opacity-60'}`}
                                        >
                                            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Sun size={24} /></div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-slate-700">Modo Claro</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Interfaz clásica</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setDarkMode(true)}
                                            className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${darkMode ? 'bg-slate-900 border-blue-500 shadow-xl' : 'bg-slate-900/50 border-slate-800 opacity-40'}`}
                                        >
                                            <div className="p-3 bg-slate-800 text-slate-300 rounded-2xl"><Moon size={24} /></div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-slate-200">Modo Oscuro</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Interfaz moderna</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {settingsTab === 'categories' && (
                                <div className="animate-in fade-in">
                                    <button onClick={() => setEditingCategory({ id: '', name: '', iconKey: 'home', color: 'bg-slate-100 text-slate-600', subs: [] })} className="fixed bottom-24 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/30 active:scale-95 transition-transform" aria-label="Nueva Categoría">
                                        <Plus size={24} strokeWidth={3} />
                                    </button>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                        {categories.map(cat => (
                                            <div key={cat.id} className="p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`p-2 rounded-2xl ${cat.color.split(' ')[0]} ${cat.color.split(' ')[1]}`}>{ICON_LIB[cat.iconKey]}</div>
                                                    <div className="flex-1 font-bold text-sm dark:text-white">{cat.name}</div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setEditingCategory(cat)} title="Editar" className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-blue-500 hover:bg-blue-50"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDeleteCategory(cat.id)} title="Eliminar" className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 ml-2">
                                                    {cat.subs.map(sub => (
                                                        <div key={sub} className="group relative text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 transition-colors cursor-default">
                                                            {sub}
                                                            <button
                                                                onClick={() => handleDeleteSubcategory(cat.id, sub)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                                title="Eliminar Subcategoría"
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => {
                                                        setInputModal({ open: true, title: `Nueva subcategoría en ${cat.name}`, placeholder: "Nombre...", value: "", catId: cat.id });
                                                    }} className="text-[10px] border border-dashed border-slate-300 text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-50 hover:text-blue-500 hover:border-blue-300 transition-colors">+ Agregar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </main>

                {/* --- NAVBAR FIX: Show on mobile only --- */}
                <nav className={`flex-none md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center z-30 transition-transform duration-300 ${isKeyboardOpen ? 'translate-y-full' : 'translate-y-0'}`}>
                    <button onClick={() => setActiveTab('dashboard')} aria-label="Ir a Inicio" title="Panel principal" className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><PieChart size={24} /><span className="text-[10px] font-bold mt-1">Inicio</span></button>
                    <button onClick={() => setActiveTab('recurring')} aria-label="Ir a Gastos Fijos" title="Gastos e ingresos fijos" className={`flex flex-col items-center p-2 ${activeTab === 'recurring' ? 'text-blue-600' : 'text-slate-400'}`}><Repeat size={24} /><span className="text-[10px] font-bold mt-1">Fijos</span></button>
                    <button onClick={() => setActiveTab('input')} aria-label="Agregar nuevo gasto" title="Ingresar gasto" className={`flex flex-col items-center p-2 ${activeTab === 'input' ? 'text-blue-600' : 'text-slate-400'}`}><Plus size={32} className="bg-blue-600 text-white rounded-full p-1.5 shadow-lg" /></button>
                    <button onClick={() => setActiveTab('list')} aria-label="Ir a Movimientos" title="Histórico de movimientos" className={`flex flex-col items-center p-2 ${activeTab === 'list' ? 'text-blue-600' : 'text-slate-400'}`}><ListTodo size={24} /><span className="text-[10px] font-bold mt-1">Movs.</span></button>
                    <button onClick={() => { setActiveTab('settings'); setSettingsTab('menu'); }} aria-label="Ajustes" title="Configuración" className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}><Settings size={24} /><span className="text-[10px] font-bold mt-1">Ajustes</span></button>
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
                            <button onClick={handleSaveRecurring} aria-label="Guardar registro fijo" title="Confirmar y guardar" className="w-full py-3 bg-blue-600 text-white rounded-full font-bold">Guardar</button>
                            <button onClick={() => setShowRecModal(false)} aria-label="Cancelar cambios" title="Cerrar modal" className="w-full py-2 text-slate-400 text-xs text-center border-t border-transparent hover:text-slate-600 transition-colors">Cancelar</button>
                        </div>
                    </div>
                )}
                {showBulkModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full sm:w-[90%] rounded-t-3xl sm:rounded-3xl p-6 h-[85vh] sm:h-auto flex flex-col animate-in slide-in-from-bottom-10">
                            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><UploadCloud className="text-blue-500" /> Importador IA</h2><button onClick={() => setShowBulkModal(false)} aria-label="Cerrar importador" title="Cerrar ventana"><X className="dark:text-white" /></button></div>
                            <div className="flex-1 overflow-y-auto space-y-4"><div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-800"><div className="flex justify-between items-start mb-2"><label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">1. Prompt</label><button onClick={copyPrompt} aria-label="Copiar prompt IA" title="Copiar al portapapeles" className={`text-xs px-3 py-1.5 rounded-full font-bold ${isCopied ? 'bg-green-500 text-white' : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700'}`}>{isCopied ? '¡Copiado!' : 'Copiar'}</button></div><p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 p-2 bg-white dark:bg-slate-950 rounded border border-indigo-100 dark:border-indigo-900/50">{AI_PROMPT}</p></div><div><label htmlFor="csv-input" className="text-xs font-bold text-slate-400 uppercase mb-2 block">2. Pegar CSV</label><textarea id="csv-input" value={csvText} onChange={(e) => setCsvText(e.target.value)} title="Entrada de datos CSV" className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 text-xs font-mono dark:text-white" placeholder="Pegar aquí..."></textarea></div><button onClick={handleBulkImport} aria-label="Procesar datos pegados" title="Ejecutar importación" className="w-full py-4 bg-blue-600 text-white font-bold rounded-full">Procesar</button></div>
                        </div>
                    </div>
                )}
                {editingTx && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="font-bold text-lg dark:text-white">Editar Movimiento</h3>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="text-xs text-slate-400 uppercase font-bold" htmlFor="edit-amount">Monto</label>
                                    <input
                                        id="edit-amount"
                                        type="number"
                                        step="0.01"
                                        aria-label="Monto"
                                        title="Editar monto"
                                        value={editAmountStr}
                                        onChange={(e) => {
                                            setEditAmountStr(e.target.value);
                                            setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 });
                                        }}
                                        onBlur={() => {
                                            const val = parseFloat(editAmountStr);
                                            if (!isNaN(val)) setEditAmountStr(val % 1 === 0 ? val.toString() : val.toFixed(2));
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white mt-1"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-xs text-slate-400 uppercase font-bold">Fecha</label>
                                    <button
                                        onClick={() => { setCalendarTarget('edit'); setCalendarModal(true); }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white mt-1 text-sm text-center border border-transparent active:scale-95 transition-transform"
                                    >
                                        {new Date(safeDate(editingTx.date)).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </button>
                                </div>
                            </div>
                            <div><label className="text-xs text-slate-400 uppercase font-bold">Categoría y Subcategoría</label>
                                <div className="flex gap-2 mt-1">
                                    <button
                                        onClick={() => setOptionPicker({
                                            title: "Seleccionar Categoría",
                                            options: categories.map(c => c.name),
                                            onSelect: (val) => setEditingTx({ ...editingTx, category: val, sub: '' })
                                        })}
                                        className="w-1/2 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl dark:text-white text-xs font-bold text-left flex justify-between items-center border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform"
                                    >
                                        <span className="truncate">{editingTx.category}</span>
                                        <ChevronDown size={14} className="text-slate-400 ml-1 flex-shrink-0" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const cat = categories.find(c => c.name === editingTx.category);
                                            if (cat) {
                                                setOptionPicker({
                                                    title: "Seleccionar Subcategoría",
                                                    options: cat.subs,
                                                    onSelect: (val) => setEditingTx({ ...editingTx, sub: val })
                                                })
                                            }
                                        }}
                                        className="w-1/2 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl dark:text-white text-xs font-bold text-left flex justify-between items-center border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform"
                                    >
                                        <span className="truncate">{editingTx.sub || 'Seleccionar...'}</span>
                                        <ChevronDown size={14} className="text-slate-400 ml-1 flex-shrink-0" />
                                    </button>
                                </div>
                            </div>
                            <div><label className="text-xs text-slate-400 uppercase font-bold" htmlFor="edit-note">Nota</label><input id="edit-note" type="text" aria-label="Nota" title="Nota adicional" value={editingTx.notes} onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white mt-1" /></div>
                            <div className="flex gap-3 pt-2"><button onClick={() => handleDelete(editingTx.id)} aria-label="Eliminar este movimiento" title="Borrar permanentemente" className="flex-1 py-3 bg-red-100 text-red-600 rounded-full font-bold flex justify-center items-center gap-2"><Trash2 size={18} /> Borrar</button><button onClick={handleUpdate} aria-label="Actualizar movimiento" title="Guardar cambios realizados" className="flex-1 py-3 bg-blue-600 text-white rounded-full font-bold">Guardar</button></div>
                            <button onClick={() => setEditingTx(null)} aria-label="Cancelar edición" title="Volver sin guardar" className="w-full py-2 text-slate-400 text-xs">Cancelar</button>
                        </div>
                    </div>
                )}
                {editingCategory && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col relative">
                            <h3 className="font-bold text-lg dark:text-white mb-4 text-center">{editingCategory.id ? 'Editar' : 'Nueva'} Categoría</h3>

                            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1">
                                {/* Name Input */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nombre</label>
                                    <input
                                        type="text"
                                        value={editingCategory.name}
                                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl dark:text-white font-bold text-lg border border-transparent focus:border-blue-500 transition-all outline-none"
                                        placeholder="Nombre..."
                                    />
                                </div>

                                {/* Color Accordion */}
                                <details className="group bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 open:pb-4 transition-all">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-bold text-slate-700 dark:text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">Color</span>
                                            <div className={`w-6 h-6 rounded-full ${editingCategory.color.split(' ')[0]} border border-slate-200 dark:border-slate-600`}></div>
                                        </div>
                                        <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="px-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2">
                                        {COLORS_LIB.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setEditingCategory({ ...editingCategory, color: c })}
                                                className={`w-10 h-10 rounded-full border-4 transition-all ${c.split(' ')[0]} ${editingCategory.color === c ? 'border-white dark:border-slate-600 scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </details>

                                {/* Icon Accordion */}
                                <details className="group bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 open:pb-4 transition-all" open>
                                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-bold text-slate-700 dark:text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">Icono</span>
                                            <div className="text-blue-500">{ICON_LIB[editingCategory.iconKey]}</div>
                                        </div>
                                        <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="px-4 grid grid-cols-6 gap-2 animate-in slide-in-from-top-2">
                                        {Object.entries(ICON_LIB).map(([key, component]: [string, any]) => (
                                            <button
                                                key={key}
                                                onClick={() => setEditingCategory({ ...editingCategory, iconKey: key })}
                                                className={`p-2 rounded-xl flex items-center justify-center transition-all aspect-square ${editingCategory.iconKey === key ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                            >
                                                {component}
                                            </button>
                                        ))}
                                    </div>
                                </details>
                            </div>

                            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setEditingCategory(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-full hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button onClick={() => saveCategoryEdit(editingCategory)} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-transform active:scale-95">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'add' && (
                    <div className="p-4 flex flex-col items-center justify-center h-full space-y-4 animate-in zoom-in-95">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-100 p-4 rounded-xl dark:bg-slate-800 dark:text-white font-bold text-center" />

                        <div className="grid grid-cols-4 gap-2 w-full max-h-[40vh] overflow-y-auto p-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCat(cat); setSubCat(''); }}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${selectedCat?.id === cat.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
                                >
                                    <div className={`p-2 rounded-full mb-1 ${selectedCat?.id === cat.id ? 'bg-white/20' : cat.color.split(' ')[0]}`}>{ICON_LIB[cat.iconKey]}</div>
                                    <span className="text-[10px] font-bold truncate w-full text-center">{cat.name}</span>
                                </button>
                            ))}
                        </div>

                        {selectedCat && selectedCat.subs.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center w-full">
                                {selectedCat.subs.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSubCat(s)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${subCat === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-100 p-4 rounded-xl dark:bg-slate-800 dark:text-white font-bold text-3xl text-center outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..." className="w-full bg-slate-100 p-3 rounded-xl dark:bg-slate-800 dark:text-white text-center" />
                        <button onClick={handleSave} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 active:scale-95 transition-transform">
                            Guardar Gasto
                        </button>
                    </div>
                )}

                {/* --- CUSTOM TOAST --- */}
                {toast && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 backdrop-blur-md border border-white/20 bg-slate-900/90 text-white min-w-[300px]">
                        <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={16} className="text-white" /> : <AlertCircle size={16} className="text-white" />}
                        </div>
                        <div className="flex-1 font-bold text-sm tracking-wide">{toast.msg}</div>
                    </div>
                )}

                {/* --- CUSTOM CONFIRM MODAL --- */}
                {confirmModal && (
                    <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirmación</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">{confirmModal.msg}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-full transition-colors hover:bg-slate-200">Cancelar</button>
                                <button onClick={confirmModal.onConfirm} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors">Confirmar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CUSTOM INPUT MODAL --- */}
                {inputModal && (
                    <div className="absolute inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{inputModal.title}</h3>
                            <input
                                autoFocus
                                type="text"
                                value={inputModal.value}
                                onChange={e => setInputModal({ ...inputModal, value: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && submitSubcategory()}
                                placeholder={inputModal.placeholder}
                                className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl dark:text-white font-bold mb-6 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setInputModal(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-full transition-colors hover:bg-slate-200">Cancelar</button>
                                <button onClick={submitSubcategory} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CALENDAR MODAL --- */}
                {calendarModal && (
                    <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <DatePicker
                            value={calendarTarget === 'new' ? date : (editingTx?.date || date)}
                            onChange={(newVal) => {
                                if (calendarTarget === 'new') setDate(newVal);
                                else if (editingTx) setEditingTx({ ...editingTx, date: newVal });
                            }}
                            onClose={() => setCalendarModal(false)}
                        />
                    </div>
                )}
                {/* --- OPTION PICKER MODAL --- */}
                {optionPicker && (
                    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[70vh]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg dark:text-white">{optionPicker.title}</h3>
                                <button onClick={() => setOptionPicker(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
                            </div>
                            <div className="overflow-y-auto space-y-2 no-scrollbar pb-4">
                                {optionPicker.options.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No hay opciones disponibles</div>}
                                {optionPicker.options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { optionPicker.onSelect(opt); setOptionPicker(null); }}
                                        className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};