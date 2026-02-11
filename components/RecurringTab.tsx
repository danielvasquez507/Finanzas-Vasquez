import React, { useState, useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Wallet, Search, Filter, Calendar, CheckSquare, X } from 'lucide-react';
import { RecurringItem, Category } from '@/types';

interface RecurringTabProps {
    recurringTab: string;
    setRecurringTab: (tab: string) => void;
    recStats: { totalIncome: number, totalExpense: number };
    recList: RecurringItem[];
    openEditRecModal: (item: RecurringItem) => void;
    handleDeleteRecurring: (id: string, e: React.MouseEvent) => void;
    openNewRecModal: () => void;
    handleApplySelected: (selectedIds: string[], date: string) => void;
    currentUser: string;
    categories: any[];
}

const RecurringTab = ({
    recurringTab,
    setRecurringTab,
    recStats,
    recList,
    openEditRecModal,
    handleDeleteRecurring,
    openNewRecModal,
    handleApplySelected,
    currentUser,
    categories
}: RecurringTabProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [applyDate, setApplyDate] = useState(new Date().toISOString().split('T')[0]);

    // UI States
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const filteredList = useMemo(() => {
        let items = recList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterType !== 'all') {
            items = items.filter(i => i.type === filterType);
        }

        // In selection mode, ONLY show expenses
        if (isSelectionMode) {
            items = items.filter(i => i.type === 'expense');
        }

        // Sort by owner (Prioritize current user)
        items.sort((a, b) => {
            if (a.owner === currentUser && b.owner !== currentUser) return -1;
            if (a.owner !== currentUser && b.owner === currentUser) return 1;
            return 0;
        });

        return items;
    }, [recList, searchTerm, filterType, isSelectionMode, currentUser]);

    const toggleSelection = (id: string) => {
        if (!isSelectionMode) return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredList.map(i => i.id));
        }
    };

    const onApplyClick = () => {
        handleApplySelected(selectedIds, applyDate);
        setSelectedIds([]);
    };

    // Calculate totals for specific owners when "All" is selected
    const getOwnerBreakdown = () => {
        const breakdown: Record<string, { income: number, expense: number }> = {};
        recList.forEach(r => {
            if (!breakdown[r.owner]) breakdown[r.owner] = { income: 0, expense: 0 };
            if (r.type === 'income') breakdown[r.owner].income += r.amount;
            else breakdown[r.owner].expense += r.amount;
        });
        return breakdown;
    };

    const ownerBreakdown = getOwnerBreakdown();

    return (
        <div className="pt-4 px-4 pb-24 animate-in fade-in space-y-6 max-w-none mx-auto">
            {/* Header Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {['all', 'Daniel', 'Gedalya'].map(t => (
                            <button
                                key={t}
                                onClick={() => setRecurringTab(t)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${recurringTab === t ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                                {t === 'all' ? 'Todos' : t}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-full border transition-all ${showFilters || filterType !== 'all' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}
                        >
                            <Filter size={18} />
                        </button>
                        <button
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedIds([]);
                            }}
                            className={`p-2 rounded-full border transition-all ${isSelectionMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}
                            title="Modo Generación"
                        >
                            {isSelectionMode ? <X size={18} /> : <CheckSquare size={18} />}
                        </button>
                    </div>
                </div>

            </div>


            {/* Selection Mode Actions */}
            {isSelectionMode && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-top-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={14} />
                            <input
                                type="date"
                                value={applyDate}
                                onChange={(e) => setApplyDate(e.target.value)}
                                className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={onApplyClick}
                            disabled={selectedIds.length === 0}
                            className={`text-xs px-6 py-2 rounded-xl font-bold transition-all ${selectedIds.length > 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            Generar ({selectedIds.length})
                        </button>
                    </div>
                    <button onClick={toggleAll} className="text-xs text-indigo-500 font-bold hover:underline">
                        {selectedIds.length === filteredList.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            {
                !isSelectionMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                                <ArrowUpCircle size={16} /> <span className="text-xs font-bold uppercase">Ingresos</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">${recStats.totalIncome.toFixed(2)}</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                                <ArrowDownCircle size={16} /> <span className="text-xs font-bold uppercase">Fijos</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">${recStats.totalExpense.toFixed(2)}</div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                                <Wallet size={16} /> <span className="text-xs font-bold uppercase">Neto</span>
                            </div>
                            <div className={`text-2xl font-black ${recStats.totalIncome - recStats.totalExpense >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                                ${(recStats.totalIncome - recStats.totalExpense).toFixed(2)}
                            </div>
                        </div>

                        {recurringTab === 'all' ? (
                            Object.entries(ownerBreakdown)
                                .sort(([a], [b]) => {
                                    if (a === currentUser) return -1;
                                    if (b === currentUser) return 1;
                                    return 0;
                                })
                                .map(([owner, stats]) => (
                                    <div key={owner} className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{owner}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Neto:</span>
                                            <span className={`text-sm font-black ${stats.income - stats.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${(stats.income - stats.expense).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center col-span-1 sm:col-span-2 lg:col-span-1">
                                <div>
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Disponible (Teórico)</div>
                                    <div className="text-xl font-bold text-slate-800 dark:text-white">${(recStats.totalIncome - recStats.totalExpense).toFixed(2)}</div>
                                </div>
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200">
                                    <Wallet size={20} />
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Filters & Search - Moved Below Stats */}
            <div className={`flex gap-3 items-center transition-all overflow-hidden ${showFilters ? 'h-10 opacity-100 mb-4' : 'h-0 opacity-0'}`}>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-xs focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                    <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}>Todos</button>
                    <button onClick={() => setFilterType('income')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${filterType === 'income' ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>Ing</button>
                    <button onClick={() => setFilterType('expense')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${filterType === 'expense' ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}>Gas</button>
                </div>
            </div>

            <div className="space-y-4">
                {!isSelectionMode && (
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {searchTerm || filterType !== 'all' ? `Resultados (${filteredList.length})` : 'Detalle'}
                        </h3>
                        <button onClick={openNewRecModal} aria-label="Agregar nuevo registro fijo" title="Agregar concepto fijo" className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">+ Agregar</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredList.map(r => (
                        <div
                            key={r.id}
                            onClick={() => isSelectionMode ? toggleSelection(r.id) : openEditRecModal(r)}
                            className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center transition-all cursor-pointer relative overflow-hidden ${isSelectionMode
                                ? (selectedIds.includes(r.id) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100')
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800'
                                }`}
                        >
                            {/* Selection Checkbox Overlay */}
                            {isSelectionMode && (
                                <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedIds.includes(r.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                                    {selectedIds.includes(r.id) && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                            )}

                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${r.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {r.type === 'income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                                </div>
                                <div className="truncate pr-6">
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{r.name}</div>
                                    <div className="flex gap-2 mt-1">
                                        <div className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block border border-slate-200 dark:border-slate-700">{r.owner}</div>
                                        {r.category && <div className="text-[10px] text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block border border-blue-100 dark:border-blue-800">{r.category}</div>}
                                    </div>
                                </div>
                            </div>

                            {!isSelectionMode && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-black text-lg dark:text-white">${r.amount.toFixed(2)}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRecurring(r.id, e); }} className="text-red-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button>
                                </div>
                            )}

                            {isSelectionMode && (
                                <div className="flex flex-col items-end gap-1 mt-6">
                                    <span className={`font-black text-lg ${selectedIds.includes(r.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>${r.amount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={24} />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">No se encontraron conceptos fijos</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default RecurringTab;
