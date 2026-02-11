import React from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { ICON_LIB } from '@/lib/icons';
import { getWeekRange, formatDateRange } from '@/lib/utils';
import { Category, Transaction } from '@/types';

interface DashboardTabProps {
    dashFilter: 'week' | 'month' | 'year';
    setDashFilter: (filter: 'week' | 'month' | 'year') => void;
    viewDate: Date;
    navigateTime: (direction: number) => void;
    getTimeLabel: () => string;
    getChartData: () => { sorted: any[], totalSum: number };
    handleBarClick: (catName: string) => void;
    categories: Category[];
}

const BarChart = ({ data, categories, onBarClick }: { data: any[], categories: Category[], onBarClick?: (name: string) => void }) => {
    if (data.length === 0) return <div className="text-center text-slate-400 py-8 text-xs italic">Sin datos</div>;
    const maxVal = Math.max(...data.map(i => i.val));
    return (
        <div className="space-y-4 mt-4">
            {data.map((item, i) => {
                const percent = (item.val / maxVal) * 100;
                const cat = categories.find(c => c.name === item.name) || { color: 'bg-slate-200', iconKey: 'more' };
                return (
                    <div key={i} className="group cursor-pointer active:scale-[0.98] transition-transform" onClick={() => onBarClick?.(item.name)}>
                        <div className="flex justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${cat.color.split(' ')[0]} ${cat.color.split(' ')[1]} bg-opacity-10`}>{ICON_LIB[cat.iconKey]}</div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-black dark:text-white">${item.val.toFixed(2)}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ver detalles →</div>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ease-out dynamic-bar ${cat.color.split(' ')[0]}`} style={{ '--progress-width': `${percent}%` } as React.CSSProperties}></div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const DashboardTab = ({
    dashFilter,
    setDashFilter,
    viewDate,
    navigateTime,
    getTimeLabel,
    getChartData,
    handleBarClick,
    categories
}: DashboardTabProps) => {
    const { sorted, totalSum } = getChartData();
    const now = new Date();
    const isPresent = dashFilter === 'year'
        ? viewDate.getFullYear() === now.getFullYear()
        : dashFilter === 'month'
            ? viewDate.getMonth() === now.getMonth() && viewDate.getFullYear() === now.getFullYear()
            : getWeekRange(viewDate).start.getTime() === getWeekRange(now).start.getTime();

    return (
        <div className="pt-4 px-4 pb-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col gap-3">
                <div className="bg-slate-200 dark:bg-slate-800 rounded-full flex font-bold text-xs relative overflow-hidden">
                    {['week', 'month', 'year'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setDashFilter(filter as any)}
                            aria-label={`Filtrar por ${filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}`}
                            title={`Ver por ${filter === 'week' ? 'semana' : filter === 'month' ? 'mes' : 'año'}`}
                            className={`flex-1 py-2.5 transition-all outline-none capitalize ${dashFilter === filter ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
                        >
                            {filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <button onClick={() => navigateTime(-1)} aria-label="Anterior" title="Anterior" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
                    <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{getTimeLabel()}</span>
                    <button onClick={() => navigateTime(1)} aria-label="Siguiente" title="Siguiente" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm flex flex-col justify-center items-center h-full group transition-all duration-500 ${isPresent ? 'border-blue-100 dark:border-blue-900/30' : 'border-amber-100 dark:border-amber-900/30'}`}>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 opacity-70">
                        Total Gastado ({dashFilter === 'week' ? 'Semana' : dashFilter === 'month' ? 'Mes' : 'Año'})
                    </span>
                    <div className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter hover:scale-105 transition-transform duration-500 cursor-default">
                        ${totalSum.toFixed(2)}
                    </div>
                    <div className={`mt-3 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm animate-in fade-in zoom-in-90 duration-700 ${isPresent
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50'
                        }`}>
                        {isPresent ? 'Período Actual' : 'Consulta Histórica'}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-blue-500" /> Desglose por Categoría</h3>
                    <BarChart data={sorted} categories={categories} onBarClick={handleBarClick} />
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
