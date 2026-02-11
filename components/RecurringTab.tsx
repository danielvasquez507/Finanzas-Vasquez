import React, { useState, useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Search, Filter, Calendar, CheckSquare, X, Plus } from 'lucide-react';
import { RecurringItem, Category } from '@/types';

interface RecurringTabProps {
    recurring: RecurringItem[];
    setRecurring: (val: RecurringItem[]) => void;
    currentUser: string;
    onEdit: (item: RecurringItem) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onApplySelected: (selectedIds: string[], date: string) => void;
    users: { id: string, name: string, color?: string }[];
    categories: Category[];
}

const RecurringTab = ({
    recurring,
    setRecurring,
    currentUser,
    onEdit,
    onDelete,
    onApplySelected,
    users,
    categories
}: RecurringTabProps) => {
    // 1. Base List (Non-deleted)
    const recList = useMemo(() => recurring.filter(r => !r.deletedAt), [recurring]);

    // 2. UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [applyDate, setApplyDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [ownerFilter, setOwnerFilter] = useState('all');
    const [showFab, setShowFab] = useState(false);

    // 3. Filtered List (Applies Search, Filters, selection mode logic)
    const filteredList = useMemo(() => {
        let items = recList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterType !== 'all') {
            items = items.filter(i => i.type === filterType);
        }

        if (ownerFilter !== 'all') {
            items = items.filter(i => i.owner === ownerFilter);
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
    }, [recList, searchTerm, filterType, ownerFilter, isSelectionMode, currentUser]);

    // 4. Stats derived from FILTERED list (Reflects search/filters)
    const recStats = useMemo(() => filteredList.reduce((acc, curr) => {
        if (curr.type === 'income') acc.totalIncome += curr.amount;
        else acc.totalExpense += curr.amount;
        return acc;
    }, { totalIncome: 0, totalExpense: 0 }), [filteredList]);

    // 5. Breakdown derived from FILTERED list
    const ownerBreakdown = useMemo(() => {
        const breakdown: Record<string, { income: number, expense: number }> = {};

        // Initialize human users
        users.forEach(u => breakdown[u.name] = { income: 0, expense: 0 });
        breakdown['Ambos'] = { income: 0, expense: 0 };

        filteredList.forEach(r => {
            if (r.owner === 'Ambos') {
                const couple = ['Daniel', 'Gedalya'];
                const presentCouple = couple.filter(n => users.some(u => u.name === n));
                const count = presentCouple.length || 1;
                const split = r.amount / count;

                presentCouple.forEach(name => {
                    if (breakdown[name]) {
                        if (r.type === 'income') breakdown[name].income += split;
                        else breakdown[name].expense += split;
                    }
                });

                if (r.type === 'income') breakdown['Ambos'].income += r.amount;
                else breakdown['Ambos'].expense += r.amount;
            } else {
                if (!breakdown[r.owner]) breakdown[r.owner] = { income: 0, expense: 0 };
                if (r.type === 'income') breakdown[r.owner].income += r.amount;
                else breakdown[r.owner].expense += r.amount;
            }
        });
        return breakdown;
    }, [filteredList, users]);

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
        onApplySelected(selectedIds, applyDate);
        setSelectedIds([]);
        setIsSelectionMode(false);
    };

    return (
        <div className="pt-4 px-4 pb-24 animate-in fade-in space-y-6 max-w-none mx-auto">
            {/* Stats Cards Section */}
            {!isSelectionMode && (
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/20 flex items-center justify-between">
                            <div>
                                <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Ingresos Totales</div>
                                <div className="text-xl font-black text-slate-800 dark:text-white">${recStats.totalIncome.toFixed(2)}</div>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><ArrowUpCircle size={20} /></div>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-3xl border border-rose-100 dark:border-rose-800/20 flex items-center justify-between">
                            <div>
                                <div className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-0.5">Gastos Fijos</div>
                                <div className="text-xl font-black text-slate-800 dark:text-white">${recStats.totalExpense.toFixed(2)}</div>
                            </div>
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl"><ArrowDownCircle size={20} /></div>
                        </div>
                    </div>

                    {/* Minimalist User Neto Cards */}
                    {/* Dynamic Net Balance Card (Replaces individual user cards) */}
                    {/* Dynamic Net Balance Card (Replaces individual user cards) */}
                    <div className="w-full">
                        <div className={`p-4 rounded-3xl border shadow-sm flex items-center justify-between transition-all ${(recStats.totalIncome - recStats.totalExpense) >= 0
                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/20'
                            : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/20'
                            }`}>
                            <div>
                                <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${(recStats.totalIncome - recStats.totalExpense) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
                                    }`}>Balance Neto</div>
                                <div className="text-xl font-black text-slate-800 dark:text-white">
                                    ${(recStats.totalIncome - recStats.totalExpense).toFixed(2)}
                                </div>
                            </div>
                            <div className={`p-2 rounded-xl text-white ${(recStats.totalIncome - recStats.totalExpense) >= 0 ? 'bg-blue-500/30 text-blue-500 shadow-lg shadow-blue-500/10' : 'bg-orange-500/30 text-orange-500 shadow-lg shadow-orange-500/10'
                                }`}>
                                {(recStats.totalIncome - recStats.totalExpense) >= 0 ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Controls (Tabs & Filter Toggles) */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button
                            onClick={() => setOwnerFilter('all')}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${ownerFilter === 'all' ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
                        >
                            Todos
                        </button>
                        {users.map(u => (
                            <button
                                key={u.name}
                                onClick={() => setOwnerFilter(u.name)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${ownerFilter === u.name ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                                {u.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters & Search Expansion (Single Row) */}
            <div className={`flex flex-col gap-3 transition-all overflow-hidden ${showFilters ? 'h-auto opacity-100 mb-2' : 'h-0 opacity-0 overflow-hidden'}`}>
                <div className="flex flex-row gap-2 items-center">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 w-fit flex-none overflow-x-auto no-scrollbar max-w-[50%] sm:max-w-none">
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterType('income')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${filterType === 'income' ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>Ingresos</button>
                        <button onClick={() => setFilterType('expense')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${filterType === 'expense' ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}>Fijos</button>
                    </div>
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
                </div>
            </div>

            {/* Selection Mode Actions (Moved Below Filters) */}
            {
                isSelectionMode && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 mb-6">
                        <div className="flex flex-col gap-6">
                            {/* Header / Title */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-700 dark:text-white">Generar Mes</h3>
                                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {selectedIds.length} Seleccionados
                                </div>
                            </div>

                            {/* Calendar Section (Bigger & Styled) */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 flex flex-col gap-2 border-2 border-slate-100 dark:border-slate-700 group focus-within:border-indigo-500 transition-colors relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Calendar size={100} className="text-indigo-500" />
                                </div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Fecha de Aplicación</label>
                                <input
                                    type="date"
                                    value={applyDate}
                                    onChange={(e) => setApplyDate(e.target.value)}
                                    className="bg-transparent text-3xl font-black text-slate-700 dark:text-white outline-none w-full cursor-pointer relative z-10"
                                />
                            </div>

                            {/* Actions Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={toggleAll}
                                    className="p-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {selectedIds.length === filteredList.length ? <CheckSquare size={16} /> : <CheckSquare size={16} className="opacity-50" />}
                                    <span className="text-xs">{selectedIds.length === filteredList.length ? 'Deseleccionar' : 'Seleccionar Todo'}</span>
                                </button>
                                <button
                                    onClick={() => setIsSelectionMode(false)}
                                    className="p-3 rounded-xl font-bold bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-xs">Cancelar</span>
                                </button>
                                <button
                                    onClick={onApplyClick}
                                    disabled={selectedIds.length === 0}
                                    className={`col-span-2 p-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all ${selectedIds.length > 0
                                        ? 'bg-indigo-600 shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                        }`}
                                >
                                    <CheckSquare size={20} strokeWidth={3} />
                                    <span>Confirmar Generación</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Items List Detail Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {filteredList.length} Registros
                    {(ownerFilter !== 'all' || filterType !== 'all') && <span className="text-blue-500 ml-1">(Filtrado)</span>}
                </h3>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredList.map(r => (
                    <div
                        key={r.id}
                        onClick={() => isSelectionMode ? toggleSelection(r.id) : onEdit(r)}
                        className={`p-4 rounded-3xl border shadow-sm flex justify-between items-center transition-all cursor-pointer relative overflow-hidden ${isSelectionMode
                            ? (selectedIds.includes(r.id) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60')
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1'
                            }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2.5 rounded-2xl flex-shrink-0 ${r.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600'}`}>
                                {r.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{r.name}</div>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    <div className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{r.owner}</div>
                                    {r.category && (
                                        <div className="text-[8px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                                            {r.category}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 ml-4">
                            <span className="font-black text-lg dark:text-white tracking-tight">${r.amount.toLocaleString()}</span>
                            {!isSelectionMode && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(r.id, e); }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            {isSelectionMode && selectedIds.includes(r.id) && (
                                <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center scale-110 shadow-lg">
                                    <CheckSquare size={12} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredList.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <Search size={32} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">No se encontraron registros fijos</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3">
                {showFab && (
                    <div className="flex flex-col items-end gap-3 animate-in slide-in-from-bottom-2 duration-200 pb-2">
                        <button
                            onClick={() => { onEdit({ id: '', name: '', amount: 0, owner: currentUser, type: 'expense' }); setShowFab(false); }}
                            className="bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-110 transition-transform"
                            title="Nuevo"
                        >
                            <Plus size={24} />
                        </button>

                        <button
                            onClick={() => { setShowFilters(!showFilters); setShowFab(false); }}
                            className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 w-12 h-12 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition-transform"
                            title="Filtrar"
                        >
                            <Filter size={20} />
                        </button>

                        <button
                            onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); setShowFab(false); }}
                            className="bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:scale-110 transition-transform"
                            title="Generar"
                        >
                            <CheckSquare size={20} />
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setShowFab(!showFab)}
                    className={`p-3 rounded-full shadow-xl transition-all ${showFab ? 'bg-slate-800 text-white rotate-45' : 'bg-blue-600 text-white hover:scale-105'}`}
                >
                    <Plus size={24} strokeWidth={3} />
                </button>
            </div>
        </div >
    );
};

export default RecurringTab;
