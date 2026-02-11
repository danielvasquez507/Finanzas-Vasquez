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
    Globe, Image as ImageIcon, Key, Link, Lock as LockIcon, Mail, Map as MapIcon, MapPin, MessageCircle, Mic,
    Mouse, Paperclip, Pen, Play, Power, Radio, Search, Send,
    Server, Shield, Star, Tag, Terminal, Truck, Umbrella, Video, Voicemail,
    User, HeartHandshake, Accessibility, Syringe, Thermometer,
    HardHat, Shovel, Ruler, Paintbrush, ShieldCheck, UserCog, UserCheck, Users2, Sparkles
} from 'lucide-react';

import { Category, RecurringItem, Transaction } from '@/types';
import { safeDate, getWeekRange, formatDateRange, getWeekString, mapApiToLocal, generateId } from '@/lib/utils';
import { ICON_LIB, COLORS_LIB, OWNERS } from '@/lib/icons';
import DatePicker from '@/components/DatePicker';
import TxItem from '@/components/TxItem';
import DashboardTab from '@/components/DashboardTab';
import RecurringTab from '@/components/RecurringTab';
import InputTab from '@/components/InputTab';
import ListTab from '@/components/ListTab';
import SettingsTab from '@/components/SettingsTab';



// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

import Head from 'next/head';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(true);

    // Filtros de Tiempo
    const [dashFilter, setDashFilter] = useState<'week' | 'month' | 'year'>('week');
    const [dashUserFilter, setDashUserFilter] = useState<string>('all');
    const [viewDate, setViewDate] = useState(new Date());

    // Filtro de Pantalla Movimientos
    const [listGroupMode, setListGroupMode] = useState<'week' | 'category'>('week');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [expandedInnerGroups, setExpandedInnerGroups] = useState<string[]>([]);

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
    const [settingsTab, setSettingsTab] = useState<'menu' | 'themes' | 'categories' | 'info' | 'validation'>('menu');
    const [currentUser, setCurrentUser] = useState<string>('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [users, setUsers] = useState<{ id: string, name: string, color?: string }[]>([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.length === 0) {
                // Initial Seed if no users found
                const initial = ['Daniel', 'Gedalya'];
                for (const name of initial) {
                    await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, color: 'blue' })
                    });
                }
                const res2 = await fetch('/api/users');
                const data2 = await res2.json();
                setUsers(data2);
            } else {
                setUsers(data);
            }
        } catch (e) {
            console.error("Error fetching users", e);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('fin_user');
        if (!storedUser) {
            setShowUserModal(true);
        } else {
            setCurrentUser(storedUser);
        }
    }, []);

    const handleSetUser = (user: string) => {
        setCurrentUser(user);
        localStorage.setItem('fin_user', user);
        setShowUserModal(false);
        showToast(`Usuario configurado: ${user}`, 'success');
    };

    const handleResetDevice = () => {
        localStorage.removeItem('fin_user');
        window.location.reload();
    };

    const [autoHideHeader, setAutoHideHeader] = useState(true);

    useEffect(() => {
        const storedAutoHide = localStorage.getItem('fin_auto_hide_header');
        if (storedAutoHide !== null) {
            setAutoHideHeader(storedAutoHide === 'true');
        }
    }, []);

    const toggleAutoHideHeader = () => {
        const newVal = !autoHideHeader;
        setAutoHideHeader(newVal);
        localStorage.setItem('fin_auto_hide_header', String(newVal));
        if (!newVal) setShowHeader(true);
    };

    useEffect(() => {
        if (!autoHideHeader) {
            setShowHeader(true);
            return;
        }
        const timer = setTimeout(() => setShowHeader(false), 30000);
        return () => clearTimeout(timer);
    }, [autoHideHeader, activeTab]); // Reset timer on tab change too if desired, or just autoHideHeader

    useEffect(() => {
        if (activeTab === 'list') {
            setShowListHelp(true);
            const timer = setTimeout(() => setShowListHelp(false), 30000);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);


    // DB Status & Health
    const [healthStatus, setHealthStatus] = useState<any>(null);
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);

    const checkHealth = async () => {
        setIsCheckingHealth(true);
        try {
            const res = await fetch('/api/health');
            const data = await res.json();
            setHealthStatus(data);
        } catch (e: any) {
            setHealthStatus({ status: 'error', error: e.message || "Failed to fetch health" });
        } finally {
            setIsCheckingHealth(false);
        }
    };

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

            if (txRes.ok && catRes.ok && recRes.ok) {
                const fetchedTxs = (await txRes.json()).map(mapApiToLocal);
                const fetchedCats = await catRes.json();
                const fetchedRecs = await recRes.json();

                setTransactions(fetchedTxs);
                setCategories(fetchedCats);
                setRecurring(fetchedRecs);
            }
        } catch (e) {
            console.error("Error loading data", e);
            showToast("Error conectando con el servidor", 'error');
        }
    };

    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [calendarModal, setCalendarModal] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState<'new' | 'edit'>('new');
    const [optionPicker, setOptionPicker] = useState<{ title: string, options: string[], onSelect: (val: string) => void } | null>(null);


    useEffect(() => {
        loadData();
        checkHealth();
    }, []);

    // Removed auto-clear effect to allow chart navigation to persist expansion
    // useEffect(() => {
    //     setExpandedGroups([]);
    // }, [listGroupMode]);

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
    const [inputOwner, setInputOwner] = useState<string>('Daniel');

    const [notes, setNotes] = useState('');

    // Formulario Recurrentes
    const [recType, setRecType] = useState('expense');
    const [recName, setRecName] = useState('');
    const [recAmount, setRecAmount] = useState('');
    const [recOwner, setRecOwner] = useState('Daniel');
    const [recCategory, setRecCategory] = useState('');
    const [recSub, setRecSub] = useState('');
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
        if (!amount || !selectedCat) {
            showToast("Faltan datos", 'error');
            return;
        }

        const dateObj = safeDate(date);
        const amt = parseFloat(amount);
        const week = getWeekRange(dateObj);
        const tempId = generateId(); // Generate UUID client-side

        const payload = {
            id: tempId,
            date: dateObj,
            category: selectedCat.name,
            sub: subCat,
            amount: amt,
            notes,
            isPaid: false,
            week: formatDateRange(week.start, week.end),
            owner: inputOwner,
            updatedBy: currentUser
        };

        // Optimistic Update
        const optimisticTx: Transaction = {
            ...payload,
            date: dateObj.toISOString().split('T')[0],
            week: payload.week
        };
        setTransactions([optimisticTx, ...transactions]);
        setAmount('');
        setSubCat('');
        setNotes('');
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                setTransactions([mapApiToLocal(saved), ...transactions]);
                showToast("Gasto guardado", 'success');
                setAmount(''); setSelectedCat(null); setSubCat(''); setNotes('');
            } else {
                showToast("Error al guardar", 'error');
            }
        } catch (e) {
            console.error(e);
            showToast("Error de conexión", 'error');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmModal({
            open: true,
            msg: "¿Seguro que quieres borrar este gasto?",
            onConfirm: async () => {
                // Optimistic
                setTransactions(transactions.filter(t => t.id !== id));
                showToast("Gasto eliminado", 'success');
                setConfirmModal(null);
                setEditingTx(null);

                try {
                    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
                } catch (e) {
                    console.error("Error deleting", e);
                    showToast("Error de conexión", 'error');
                }
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

        // Optimistic Update
        const updatedIds = txsToUpdate.map(t => t.id);
        const optimisticTxs = transactions.map(t => updatedIds.includes(t.id) ? { ...t, isPaid: targetState } : t);
        setTransactions(optimisticTxs);
        showToast(`Actualizando ${updatedIds.length} gastos...`, 'info');

        // Sync
        for (const tx of txsToUpdate) {
            try {
                await fetch(`/api/transactions?id=${tx.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...tx, isPaid: targetState })
                });
            } catch (e) {
                console.error("Error bulk updating", e);
                showToast("Error de conexión al actualizar en grupo", 'error');
            }
        }
    };

    const handleUpdate = async () => {
        if (!editingTx) return;
        try {
            const res = await fetch(`/api/transactions?id=${editingTx.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editingTx, updatedBy: currentUser })
            });

            if (res.ok) {
                const updated = await res.json();
                setTransactions(transactions.map(t => t.id === editingTx.id ? mapApiToLocal(updated) : t));
                setEditingTx(null);
                showToast("Gasto actualizado", 'success');
            } else {
                showToast("Error al actualizar", 'error');
            }
        } catch (e) {
            console.error(e);
            showToast("Error de conexión", 'error');
        }
    };

    const togglePaid = async (id: string) => {
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
                body: JSON.stringify({ ...tx, isPaid: newVal, updatedBy: currentUser })
            });
        } catch (e) {
            console.error("Error toggling paid", e);
            showToast("Error de conexión al cambiar estado", 'error');
        }
    };

    // --- CRUD RECURRENTES ---
    const openNewRecModal = () => {
        setRecName('');
        setRecAmount('');
        setRecOwner(currentUser === 'Gedalya' ? 'Gedalya' : 'Daniel');
        setRecCategory('');
        setRecSub('');
        setEditingRecurring(null);
        setShowRecModal(true);
    };

    const openEditRecModal = (item: RecurringItem) => {
        setRecType(item.type);
        setRecName(item.name);
        setRecAmount(item.amount.toString());
        setRecOwner(item.owner);
        setRecCategory(item.category || '');
        setRecSub(item.sub || '');
        setEditingRecurring(item);
        setShowRecModal(true);
    };

    const handleSaveRecurring = async () => {
        if (!recName || !recAmount) {
            showToast("Completa nombre y monto", 'error');
            return;
        }

        if (recType === 'expense' && (!recCategory || !recSub)) {
            showToast("Completa categoría y subcategoría", 'error');
            return;
        }

        const val = parseFloat(recAmount);
        const payload = {
            id: editingRecurring ? editingRecurring.id : undefined, // ID will be assigned by backend for new items
            type: recType,
            name: recName,
            amount: val,
            owner: recOwner,
            category: recType === 'expense' ? recCategory : null,
            sub: recType === 'expense' ? recSub : null,
            updatedBy: currentUser // Send current user for audit log
        };

        // Optimistic Update
        if (editingRecurring) {
            setRecurring(recurring.map(r => r.id === editingRecurring.id ? { ...r, ...payload, id: editingRecurring.id } : r));
        } else {
            // For new items, we need a temporary ID for optimistic update
            const tempId = generateId(); // Assuming generateId() is available
            setRecurring([...recurring, { ...payload, id: tempId }]);
            payload.id = tempId; // Assign tempId to payload for API call if backend expects it, or remove if backend generates
        }
        setShowRecModal(false); setRecName(''); setRecAmount(''); setEditingRecurring(null);
        showToast(editingRecurring ? "Recurrente actualizado" : "Recurrente creado", 'success');

        try {
            const method = editingRecurring ? 'PUT' : 'POST';
            const res = await fetch('/api/recurring', {
                method,
                body: JSON.stringify({ ...payload, updatedBy: currentUser }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const text = await res.text();
                let errorMsg = 'API Error';
                try {
                    const data = JSON.parse(text);
                    errorMsg = data.error || data.message || errorMsg;
                } catch (e) {
                    errorMsg = text || errorMsg;
                }
                throw new Error(errorMsg);
            }
        } catch (e: any) {
            console.error("Error saving recurring", e);
            // Revert optimistic update if needed, but for now just warn
            showToast(`Error de sincronización: ${e.message}`, 'error');
        }
    };

    const handleDeleteRecurring = async (id: string, e: any) => {
        e.stopPropagation();
        setConfirmModal({
            open: true,
            msg: "¿Eliminar este registro fijo?",
            onConfirm: async () => {
                setRecurring(recurring.filter(r => r.id !== id));
                if (editingRecurring?.id === id) setShowRecModal(false);
                setConfirmModal(null);
                showToast("Recurrente eliminado", 'success');

                try {
                    await fetch(`/api/recurring?id=${id}&user=${currentUser}`, { method: 'DELETE' });
                } catch (e) {
                    console.error("Error deleting", e);
                    showToast("Error de conexión", 'error');
                }
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

    const handleApplySelected = async (selectedIds: string[], dateStr: string) => {
        const selectedItems = recList.filter(r => selectedIds.includes(r.id));

        if (selectedItems.length === 0) return;

        setConfirmModal({
            open: true,
            msg: `¿Generar ${selectedItems.length} movimientos con fecha ${dateStr}?`,
            onConfirm: async () => {
                setConfirmModal(null);
                showToast(`Generando ${selectedItems.length} movimientos...`, 'info');

                const targetDate = safeDate(dateStr);
                const week = getWeekRange(targetDate);
                const weekStr = formatDateRange(week.start, week.end);

                const newTxs: Transaction[] = [];

                for (const item of selectedItems) {
                    const tempId = generateId();
                    const payload = {
                        id: tempId,
                        date: targetDate,
                        category: item.category || (item.type === 'income' ? 'Ingresos' : 'Varios'), // Use stored category or fallback
                        sub: item.sub || item.name, // Use stored sub or fallback
                        amount: item.amount,
                        notes: `Generado desde Fijos: ${item.name}`,
                        isPaid: false,
                        week: weekStr, // Keep original weekStr calculation
                        updatedBy: currentUser
                    };

                    try {
                        const res = await fetch('/api/transactions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                            const saved = await res.json();
                            newTxs.push(mapApiToLocal(saved));
                        }
                    } catch (e) {
                        console.error("Error applying fixed item:", item.name, e);
                    }
                }

                if (newTxs.length > 0) {
                    setTransactions(prev => [...newTxs, ...prev]);
                    showToast(`${newTxs.length} movimientos generados`, 'success');
                    // No cambiamos de tab automáticamente para permitir seguir editando si se desea
                } else {
                    showToast("Error al generar movimientos", 'error');
                }
            }
        });
    };


    const { stats: recStats, activeItems: recList } = getRecurringStats();

    // --- GRÁFICOS Y DATOS ---
    const getFilteredData = () => {
        return transactions.filter(t => {
            const txDate = safeDate(t.date);
            const currentView = new Date(viewDate);

            // Time Filter
            let timeMatch = false;
            if (dashFilter === 'year') timeMatch = txDate.getFullYear() === currentView.getFullYear();
            else if (dashFilter === 'month') timeMatch = txDate.getMonth() === currentView.getMonth() && txDate.getFullYear() === currentView.getFullYear();
            else {
                const txWeek = getWeekRange(txDate);
                const viewWeek = getWeekRange(currentView);
                timeMatch = txWeek.start.getTime() === viewWeek.start.getTime();
            }
            if (!timeMatch) return false;

            // User Filter
            if (dashUserFilter === 'all') return true;
            return t.owner === dashUserFilter || t.owner === 'Ambos';
        });
    };

    const getChartData = () => {
        // Filter out Income for the Expense Chart
        const expenseData = getFilteredData().filter(t => t.category !== 'Ingreso' && t.category !== 'Ingresos');
        const totals: any = {};
        let totalSum = 0;

        expenseData.forEach(t => {
            let effectiveAmount = t.amount;

            // Special handling for "Ambos" when filtering by a specific user
            if (dashUserFilter !== 'all' && t.owner === 'Ambos') {
                // Split ONLY between Daniel and Gedalya
                const couple = ['Daniel', 'Gedalya'];
                if (couple.includes(dashUserFilter)) {
                    // If the selected user is part of the couple, they get half
                    effectiveAmount = t.amount / 2;
                } else {
                    // If the selected user is NOT part of the couple (e.g. Eliam), they get 0 of "Ambos"
                    effectiveAmount = 0;
                }
            }

            totals[t.category] = (totals[t.category] || 0) + effectiveAmount;
            totalSum += effectiveAmount;
        });
        const sorted = Object.entries(totals).sort((a: any, b: any) => b[1] - a[1]).map(([name, val]: any) => ({ name, val }));

        return { sorted, totalSum };
    };

    const handleBarClick = (catName: string) => {
        const inView = getFilteredData().filter(t => t.category === catName);

        if (inView.length === 0) {
            showToast(`Sin movimientos para ${catName}`, 'info');
            return;
        }

        // Pick the absolute most recent week for this category in the current view
        const sorted = [...inView].sort((a, b) => b.date.localeCompare(a.date));
        const targetWeek = sorted[0].week;  // Removed .trim() here to match exactly with data source if needed, or keep consistent with render

        setActiveTab('list');
        setListGroupMode('week');

        // Force expansion of the target week AND the target inner category
        const innerKey = `${targetWeek}-${catName}`;
        setExpandedGroups(prev => Array.from(new Set([...prev, targetWeek])));
        setExpandedInnerGroups(prev => Array.from(new Set([...prev, innerKey])));

        // Smooth scroll to target week after UI render
        setTimeout(() => {
            const cleanId = targetWeek.replace(/\s+/g, '-');
            const el = document.getElementById(`group-${cleanId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);

        showToast(`Detalle de ${catName}`, 'info');
    };

    // --- HELPERS ---
    const getAiPrompt = () => {
        const catList = categories.map(c => c.name).join(', ');
        return `Actúa como un asistente contable experto. Tu tarea es convertir los datos de factura/texto/imagen que te pase a formato CSV para importación masiva.

FORMATO OBLIGATORIO (CSV sin encabezados):
YYYY-MM-DD, Categoría Exacta, Subcategoría, Monto, Notas

REGLAS CRÍTICAS:
1. Fecha: Formato ISO (YYYY-MM-DD).
2. Categoría: DEBE ser EXACTAMENTE una de las siguientes: ${catList}.
3. Subcategoría: Nombre del comercio o detalle corto.
4. Monto: Solo números y punto decimal (ej: 10.50).
5. Notas: Breve descripción opcional.

Ejemplo:
2026-02-20, Supermercado, Walmart, 45.00, Compra semanal
2026-02-21, Automóvil, Gasolina, 20.00, Llenado tanque

Devuelve SOLO el bloque CSV, sin texto adicional markdown.`;
    };

    const copyPrompt = () => { navigator.clipboard.writeText(getAiPrompt()); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };

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

                // Check for potential markdown code block artifacts
                if (line.startsWith('```') || line.startsWith('CSV')) continue;

                const [dateStr, catRaw, sub, amt, nts] = parts;
                const parseDate = new Date(dateStr);
                const parseAmount = parseFloat(amt);

                // Normalización de categoría: Buscar coincidencia exacta o usar la primera
                const matchedCat = categories.find(c => c.name.toLowerCase() === catRaw.toLowerCase());
                const cat = matchedCat ? matchedCat.name : catRaw;

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

                // Sync
                const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...apiPayload, updatedBy: currentUser }),
                });
                if (!res.ok) throw new Error('API Error');

                const saved = await res.json();
                newTxs.push(mapApiToLocal(saved));

            } catch (e) {
                console.error("Error importing line:", e);
                errorCount++;
            }
        }

        if (newTxs.length > 0) {
            setTransactions(prev => [...newTxs, ...prev]);
            showToast(`Importación: ${newTxs.length} procesados.`, 'success');
        } else {
            showToast("No se pudieron procesar líneas.", 'error');
        }

        setShowBulkModal(false);
        setCsvText('');
        setActiveTab('list');
    };

    const saveCategoryEdit = async (catData: Category) => {
        const isNew = !catData.id;
        const tempId = isNew ? generateId() : catData.id;

        // Validation: Duplicate Name
        const duplicate = categories.find(c =>
            c.name.trim().toLowerCase() === catData.name.trim().toLowerCase() &&
            c.id !== tempId
        );

        if (duplicate) {
            showToast("Ya existe una categoría con ese nombre", 'error');
            return;
        }

        const payload = { ...catData, id: tempId };
        const method = isNew ? 'POST' : 'PUT';

        // Optimistic
        if (isNew) {
            setCategories([...categories, payload]);
        } else {
            setCategories(categories.map(c => c.id === tempId ? payload : c));
        }
        setEditingCategory(null);
        showToast(isNew ? "Categoría creada" : "Categoría actualizada", 'success');

        try {
            const res = await fetch('/api/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, updatedBy: currentUser })
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("Error saving category", e);
            showToast("Error de conexión", 'error');
        }
    };

    const handleDeleteCategory = (id: string) => {
        setConfirmModal({
            open: true,
            msg: "¿Seguro que quieres borrar esta categoría y todo su contenido?",
            onConfirm: async () => {
                setCategories(categories.filter(c => c.id !== id));
                showToast("Categoría eliminada", 'success');
                setConfirmModal(null);

                try {
                    await fetch(`/api/categories?id=${id}&user=${currentUser}`, { method: 'DELETE' });
                } catch (e) {
                    console.error("Error deleting category", e);
                    showToast("Error de conexión", 'error');
                }
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
        setCategories(categories.map(c => c.id === catId ? { ...c, subs: newSubs } : c));
        showToast("Subcategoría agregada", 'success');

        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cat, subs: newSubs, updatedBy: currentUser })
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("Error adding subcategory", e);
            showToast("Error de conexión", 'error');
        }
    };

    const handleDeleteSubcategory = (catId: string, subToDelete: string) => {
        setConfirmModal({
            open: true,
            msg: `¿Borrar subcategoría "${subToDelete}"?`,
            onConfirm: async () => {
                const cat = categories.find(c => c.id === catId);
                if (!cat) return;
                const newSubs = cat.subs.filter(s => s !== subToDelete);
                setCategories(categories.map(c => c.id === catId ? { ...c, subs: newSubs } : c));
                showToast("Subcategoría eliminada", 'info');
                setConfirmModal(null);

                try {
                    await fetch('/api/categories', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...cat, subs: newSubs, updatedBy: currentUser })
                    });
                } catch (e) {
                    console.error("Error deleting subcategory", e);
                    showToast("Error de conexión", 'error');
                }
            }
        });
    };

    return (
        <div className={`h-[100dvh] w-full flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
            <Head>
                <title>Finanzas App</title>
                <meta name="description" content="Control de gastos familiares" />
                <link rel="icon" href="/logo_192.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
            </Head>

            {/* Container para Desktop (Full Width) */}
            <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 shadow-2xl overflow-hidden relative">


                {/* --- HEADER --- */}
                <header className={`flex-none px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition-all duration-700 overflow-hidden z-20 ${showHeader ? 'h-14 opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo_192.png" alt="Logo" className="h-8 w-auto cursor-pointer" onClick={() => setShowHeader(true)} />
                            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hidden sm:block">
                                Finanzas App
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
                    <div className="flex gap-2 items-center">
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
                        <DashboardTab
                            dashFilter={dashFilter}
                            setDashFilter={setDashFilter}
                            dashUserFilter={dashUserFilter}
                            setDashUserFilter={setDashUserFilter}
                            users={users}
                            viewDate={viewDate}
                            navigateTime={navigateTime}
                            getTimeLabel={getTimeLabel}
                            getChartData={getChartData}
                            handleBarClick={handleBarClick}
                            categories={categories}
                        />
                    )}

                    {/* FIJOS (RECURRENTES) */}
                    {activeTab === 'recurring' && (
                        <RecurringTab
                            recurring={recurring}
                            setRecurring={setRecurring}
                            currentUser={currentUser}
                            onEdit={(item) => {
                                setEditingRecurring(item.id ? item : null);
                                setRecName(item.name);
                                setRecAmount(item.id ? item.amount.toString() : '');
                                setRecType(item.type as 'income' | 'expense');
                                setRecOwner(item.owner);
                                setRecCategory(item.category || '');
                                setRecSub(item.sub || '');
                                setShowRecModal(true);
                            }}
                            onDelete={handleDeleteRecurring}
                            onApplySelected={handleApplySelected}
                            users={users}
                            categories={categories}
                        />
                    )}

                    {/* INPUT */}
                    {activeTab === 'input' && (
                        <InputTab
                            amount={amount}
                            setAmount={setAmount}
                            categories={categories}
                            selectedCat={selectedCat}
                            setSelectedCat={setSelectedCat}
                            subCat={subCat}
                            setSubCat={setSubCat}
                            date={date}
                            setCalendarTarget={setCalendarTarget}
                            setCalendarModal={setCalendarModal}
                            notes={notes}
                            setNotes={setNotes}
                            handleSave={handleSave}
                            inputOwner={inputOwner}
                            setInputOwner={setInputOwner}
                            users={users}
                        />
                    )}

                    {/* MOVIMIENTOS */}
                    {activeTab === 'list' && (
                        <ListTab
                            showListHelp={showListHelp}
                            transactions={transactions}
                            listGroupMode={listGroupMode}
                            expandedGroups={expandedGroups}
                            setExpandedGroups={setExpandedGroups}
                            expandedInnerGroups={expandedInnerGroups}
                            setExpandedInnerGroups={setExpandedInnerGroups}
                            categories={categories}
                            toggleGroupPaid={toggleGroupPaid}
                            setEditingTx={setEditingTx}
                        />
                    )}

                    {/* AJUSTES */}
                    {activeTab === 'settings' && (
                        <SettingsTab
                            settingsTab={settingsTab}
                            setSettingsTab={setSettingsTab}
                            categories={categories}
                            onEditCategory={setEditingCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onAddCategory={() => setEditingCategory({ id: '', name: '', iconKey: 'ShoppingCart', color: 'bg-blue-500 text-white', subs: [] })}
                            onResetDevice={handleResetDevice}
                            healthStatus={healthStatus}
                            isCheckingHealth={isCheckingHealth}
                            checkHealth={checkHealth}
                            autoHideHeader={autoHideHeader}
                            toggleAutoHideHeader={toggleAutoHideHeader}
                            users={users}
                            refreshUsers={fetchUsers}
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                            setShowBulkModal={setShowBulkModal}
                            onDeleteSubcategory={handleDeleteSubcategory}
                            onSetInputModal={setInputModal}
                            currentUser={currentUser}
                            setCurrentUser={setCurrentUser}
                        />
                    )}
                </main>

                {/* --- NAVBAR --- */}
                <nav className={`flex-none md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center z-30 transition-transform duration-300 pb-safe translate-y-0`}>
                    <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><PieChart size={24} /><span className="text-[10px] font-bold mt-1">Inicio</span></button>
                    <button onClick={() => setActiveTab('recurring')} className={`flex flex-col items-center p-2 ${activeTab === 'recurring' ? 'text-blue-600' : 'text-slate-400'}`}><Repeat size={24} /><span className="text-[10px] font-bold mt-1">Fijos</span></button>
                    <button onClick={() => setActiveTab('input')} className={`flex flex-col items-center p-2 ${activeTab === 'input' ? 'text-blue-600' : 'text-slate-400'}`}><Plus size={32} className="bg-blue-600 text-white rounded-full p-1.5 shadow-lg" /></button>
                    <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center p-2 ${activeTab === 'list' ? 'text-blue-600' : 'text-slate-400'}`}><ListTodo size={24} /><span className="text-[10px] font-bold mt-1">Movs.</span></button>
                    <button onClick={() => { setActiveTab('settings'); setSettingsTab('menu'); }} className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}><Settings size={24} /><span className="text-[10px] font-bold mt-1">Ajustes</span></button>
                </nav>

                {/* MODALS */}

                {/* MODALS RENDER */}
                {
                    showRecModal && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                            <div className="bg-white dark:bg-slate-900 w-full rounded-3xl p-6 shadow-2xl space-y-4">
                                <h3 className="font-bold text-lg dark:text-white">{editingRecurring ? 'Editar' : 'Nuevo'} Recurrente</h3>
                                <div className="flex gap-2"><button onClick={() => setRecType('income')} aria-label="Cambiar a tipo ingreso" title="Marcar como ingreso" className={`flex-1 py-2 rounded-2xl text-xs font-bold border ${recType === 'income' ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>Ingreso</button><button onClick={() => setRecType('expense')} aria-label="Cambiar a tipo gasto" title="Marcar como gasto" className={`flex-1 py-2 rounded-2xl text-xs font-bold border ${recType === 'expense' ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}>Gasto</button></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block" htmlFor="rec-name">Concepto</label><input id="rec-name" type="text" aria-label="Concepto" title="Nombre del concepto" value={recName} onChange={e => setRecName(e.target.value)} placeholder="Ej: Salario" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white" /></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block" htmlFor="rec-amount">Monto</label><input id="rec-amount" type="number" aria-label="Monto" title="Cantidad económica" value={recAmount} onChange={e => setRecAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white" /></div>

                                {recType === 'expense' && (
                                    <div className="space-y-2 animate-in fade-in">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block">Categoría y Sub</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setOptionPicker({
                                                    title: "Seleccionar Categoría",
                                                    options: categories.map(c => c.name),
                                                    onSelect: (val) => { setRecCategory(val); setRecSub(''); }
                                                })}
                                                className="w-1/2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white text-xs font-bold text-left flex justify-between items-center border border-slate-100 dark:border-slate-800"
                                            >
                                                <span className="truncate">{recCategory || 'Categoría'}</span>
                                                <ChevronDown size={14} className="text-slate-400 ml-1 flex-shrink-0" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const cat = categories.find(c => c.name === recCategory);
                                                    if (cat) {
                                                        setOptionPicker({
                                                            title: "Seleccionar Subcategoría",
                                                            options: cat.subs,
                                                            onSelect: (val) => setRecSub(val)
                                                        });
                                                    } else {
                                                        showToast("Selecciona categoría primero", 'info');
                                                    }
                                                }}
                                                className="w-1/2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl dark:text-white text-xs font-bold text-left flex justify-between items-center border border-slate-100 dark:border-slate-800"
                                            >
                                                <span className="truncate">{recSub || 'Subcategoría'}</span>
                                                <ChevronDown size={14} className="text-slate-400 ml-1 flex-shrink-0" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {users.map(u => (
                                        <button
                                            key={u.name}
                                            onClick={() => setRecOwner(u.name)}
                                            className={`px-4 py-2 rounded-2xl text-xs font-bold border whitespace-nowrap ${recOwner === u.name ? 'bg-blue-50 border-blue-500 text-blue-600' : 'text-slate-400 border-slate-200 dark:border-slate-800'}`}
                                        >
                                            {u.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleSaveRecurring} aria-label="Guardar registro fijo" title="Confirmar y guardar" className="w-full py-3 bg-blue-600 text-white rounded-full font-bold">Guardar</button>
                                <button onClick={() => setShowRecModal(false)} aria-label="Cancelar cambios" title="Cerrar modal" className="w-full py-2 text-slate-400 text-xs text-center border-t border-transparent hover:text-slate-600 transition-colors">Cancelar</button>
                            </div>
                        </div>
                    )
                }
                {
                    showBulkModal && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
                            <div className="bg-white dark:bg-slate-900 w-full sm:w-[90%] rounded-t-3xl sm:rounded-3xl p-6 h-[85vh] sm:h-auto flex flex-col animate-in slide-in-from-bottom-10">
                                <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><UploadCloud className="text-blue-500" /> Importador IA</h2><button onClick={() => setShowBulkModal(false)} aria-label="Cerrar importador" title="Cerrar ventana"><X className="dark:text-white" /></button></div>
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">1. Prompt</label>
                                            <button
                                                onClick={(e) => { e.preventDefault(); copyPrompt(); }}
                                                type="button"
                                                aria-label="Copiar prompt IA"
                                                title="Copiar al portapapeles"
                                                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all active:scale-95 ${isCopied ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white text-indigo-600 border border-indigo-200 shadow-sm hover:bg-indigo-50'}`}
                                            >
                                                {isCopied ? '¡Copiado!' : 'Copiar Texto'}
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <pre className="font-mono text-[10px] text-slate-600 dark:text-slate-300 p-3 bg-white dark:bg-slate-950 rounded-xl border border-indigo-100 dark:border-indigo-900/50 whitespace-pre-wrap select-all">
                                                {getAiPrompt()}
                                            </pre>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="csv-input" className="text-xs font-bold text-slate-400 uppercase mb-2 block">2. Pegar CSV</label>
                                        <textarea id="csv-input" value={csvText} onChange={(e) => setCsvText(e.target.value)} title="Entrada de datos CSV" className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 text-xs font-mono dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Pegar aquí..."></textarea>
                                    </div>
                                    <button onClick={handleBulkImport} aria-label="Procesar datos pegados" title="Ejecutar importación" className="w-full py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-600/30 active:scale-95 transition-transform">Procesar</button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    editingTx && (
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
                    )
                }
                {
                    editingCategory && (
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
                    )
                }

                {/* --- CUSTOM TOAST --- */}
                {
                    toast && (
                        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 backdrop-blur-md border border-white/20 bg-slate-900/90 text-white min-w-[300px]">
                            <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                {toast.type === 'success' ? <CheckCircle2 size={16} className="text-white" /> : <AlertCircle size={16} className="text-white" />}
                            </div>
                            <div className="flex-1 font-bold text-sm tracking-wide">{toast.msg}</div>
                        </div>
                    )
                }

                {/* --- CUSTOM CONFIRM MODAL --- */}
                {
                    confirmModal && (
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
                    )
                }

                {/* --- CUSTOM INPUT MODAL --- */}
                {
                    inputModal && (
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
                    )
                }

                {/* --- CALENDAR MODAL --- */}
                {
                    calendarModal && (
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
                    )
                }
                {/* --- OPTION PICKER MODAL --- */}
                {
                    optionPicker && (
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
                    )
                }
                {/* --- USER SELECTION MODAL (MANDATORY FOR NEW DEVICES) --- */}
                {
                    showUserModal && (
                        <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-6 animate-in fade-in duration-500">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
                                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-3xl border border-white/10 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative z-10 space-y-8 animate-in zoom-in-95 duration-700">
                                <div className="text-center space-y-4">
                                    <div className="relative mx-auto w-24 h-24">
                                        <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-40 animate-pulse"></div>
                                        <div className="relative z-10 w-full h-full flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                            <img src="/logo_192.png" alt="App Logo" className="w-24 h-24 object-contain scale-125 -rotate-12" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-white tracking-tight">Finanzas App</h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Selecciona tu perfil</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {users.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleSetUser(user.name)}
                                            className="group relative flex items-center gap-4 p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 transition-all duration-300 active:scale-95 text-left"
                                        >
                                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">{user.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter group-hover:text-blue-400 transition-colors">Acceder a mi cartera</div>
                                            </div>
                                            <ChevronRight size={20} className="ml-auto text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>

                                <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Finanzas App Pro v2.3</p>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};