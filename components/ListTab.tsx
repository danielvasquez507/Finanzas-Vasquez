import React from 'react';
import { AlertCircle, ListTodo, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ICON_LIB } from '@/lib/icons';
import { Transaction, Category } from '@/types';
import TxItem from '@/components/TxItem';

interface ListTabProps {
    showListHelp: boolean;
    transactions: Transaction[];
    listGroupMode: 'week' | 'category';
    expandedGroups: string[];
    setExpandedGroups: React.Dispatch<React.SetStateAction<string[]>>;
    expandedInnerGroups: string[];
    setExpandedInnerGroups: React.Dispatch<React.SetStateAction<string[]>>;
    categories: Category[];
    toggleGroupPaid: (targetState: boolean, filters: { week?: string, category?: string }) => void;
    setEditingTx: (tx: Transaction) => void;
}

const ListTab = ({
    showListHelp,
    transactions,
    listGroupMode,
    expandedGroups,
    setExpandedGroups,
    expandedInnerGroups,
    setExpandedInnerGroups,
    categories,
    toggleGroupPaid,
    setEditingTx
}: ListTabProps) => {
    const [showBanner, setShowBanner] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowBanner(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="animate-in fade-in space-y-4 pt-4 px-4 pb-24">
            {showListHelp && showBanner && (
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
                .sort((a, b) => {
                    if (listGroupMode === 'category') return a.localeCompare(b);
                    const dateA = transactions.find(t => t.week === a)?.date || '';
                    const dateB = transactions.find(t => t.week === b)?.date || '';
                    return dateB.localeCompare(dateA);
                })
                .map(groupKey => {
                    const groupTxs = transactions.filter(t => (listGroupMode === 'week' ? t.week : t.category) === groupKey);
                    const groupTotal = groupTxs.reduce((acc, t) => acc + t.amount, 0);
                    const catInfo = listGroupMode === 'category' ? categories.find(c => c.name === groupKey) : null;
                    const isExpanded = expandedGroups.includes(groupKey);
                    const allPaid = groupTxs.every(t => t.isPaid);

                    return (
                        <div key={groupKey} id={`group-${groupKey.replace(/\s+/g, '-')}`} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
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
                                        Array.from(new Set(groupTxs.map(t => t.category))).sort().map(catName => {
                                            const catTxs = groupTxs.filter(t => t.category === catName);
                                            const catTotal = catTxs.reduce((acc, t) => acc + t.amount, 0);
                                            const cInfo = categories.find(c => c.name === catName);
                                            const catAllPaid = catTxs.every(t => t.isPaid);
                                            const innerKey = `${groupKey}-${catName}`;
                                            const isInnerExpanded = expandedInnerGroups.includes(innerKey);

                                            return (
                                                <div key={catName} className="bg-white dark:bg-slate-950/20">
                                                    <div
                                                        onClick={() => setExpandedInnerGroups(prev => isInnerExpanded ? prev.filter(k => k !== innerKey) : [...prev, innerKey])}
                                                        className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center border-b border-slate-50 dark:border-slate-800 cursor-pointer active:bg-slate-100/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <ChevronRight size={12} className={`text-slate-400 transition-transform ${isInnerExpanded ? 'rotate-90' : ''}`} />
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
                                                    {isInnerExpanded && (
                                                        <div className="divide-y divide-slate-50 dark:divide-slate-900 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {catTxs.map(tx => (
                                                                <TxItem key={tx.id} tx={tx} cat={cInfo} onClick={() => setEditingTx(tx)} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
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
    );
};

export default ListTab;
