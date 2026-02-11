import React from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { ICON_LIB } from '@/lib/icons';
import { getWeekRange, formatDateRange } from '@/lib/utils';
import { Category, Transaction } from '@/types';

interface DashboardTabProps {
    dashFilter: 'week' | 'month' | 'year';
    setDashFilter: (filter: 'week' | 'month' | 'year') => void;
    dashUserFilter: string;
    setDashUserFilter: (user: string) => void;
    users: { name: string }[];
    viewDate: Date;
    navigateTime: (direction: number) => void;
    getTimeLabel: () => string;
    getChartData: () => { sorted: any[], totalSum: number };
    handleBarClick: (catName: string) => void;
    categories: Category[];
}

const BarChart = ({ data, categories, onBarClick }: { data: any[], categories: Category[], onBarClick?: (name: string) => void }) => {
    if (data.length === 0) return <div className="text-center text-slate-400 py-12 text-sm italic">Sin datos para este filtro</div>;
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
                                <div className={`p-1.5 rounded-2xl ${cat.color.split(' ')[0]} ${cat.color.split(' ')[1]} bg-opacity-10`}>{ICON_LIB[cat.iconKey]}</div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-black dark:text-white text-sm">${item.val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ver detalles →</div>
                            </div>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
    dashUserFilter,
    setDashUserFilter,
    users,
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
        <div className="pt-4 px-4 pb-12 space-y-6 animate-in fade-in max-w-4xl mx-auto">
            {/* Filter Section */}
            <div className="flex flex-col gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                    {['week', 'month', 'year'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setDashFilter(filter as any)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashFilter === filter ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>



                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <button onClick={() => navigateTime(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronLeft size={20} /></button>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.1em]">{getTimeLabel()}</span>
                    <button onClick={() => navigateTime(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={100} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 relative z-10">
                        {dashUserFilter !== 'all' ? `Gastos ${dashUserFilter}` : 'Gastos Totales'}
                    </span>
                    <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10 mb-1">
                        ${totalSum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    {isPresent && (
                        <div className="mt-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] font-bold uppercase tracking-wider">
                            Tiempo Real
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        Desglose {dashUserFilter !== 'all' ? `para ${dashUserFilter}` : 'General'}
                    </h3>
                    <BarChart data={sorted} categories={categories} onBarClick={handleBarClick} />
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
