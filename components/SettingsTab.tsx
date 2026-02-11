import React, { useState } from 'react';
import {
    ChevronRight, ChevronLeft, Moon, Sun, UploadCloud, Grid, AlertCircle, Plus, Edit3, Trash2, X,
    Heart, Smartphone, Search, Filter, Calendar, CheckSquare,
    ArrowUpCircle, ArrowDownCircle, UserPlus, UserMinus,
    User, Activity, Cpu, Database, RefreshCw, Repeat, ChevronUp, ChevronDown, Landmark,
    Github, Linkedin
} from 'lucide-react';
import { Category } from '@/types';
import { ICON_LIB, COLORS_LIB } from '@/lib/icons';

interface SettingsTabProps {
    settingsTab: 'menu' | 'themes' | 'categories' | 'info' | 'validation';
    setSettingsTab: (tab: 'menu' | 'themes' | 'categories' | 'info' | 'validation') => void;
    categories: Category[];
    onEditCategory: (cat: Category) => void;
    onDeleteCategory: (id: string) => void;
    onAddCategory: () => void;
    onResetDevice: () => void;
    healthStatus: any;
    checkHealth: () => void;
    isCheckingHealth: boolean;
    autoHideHeader: boolean;
    toggleAutoHideHeader: () => void;
    users: { id: string, name: string, color?: string }[];
    refreshUsers: () => void;
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    setShowBulkModal: (val: boolean) => void;
    onDeleteSubcategory: (catId: string, sub: string) => void;
    onSetInputModal: (val: any) => void;
    currentUser: string;
    setCurrentUser: (user: string) => void;
}

const SettingsTab = ({
    settingsTab,
    setSettingsTab,
    categories,
    onEditCategory,
    onDeleteCategory,
    onAddCategory,
    onResetDevice,
    healthStatus,
    checkHealth,
    isCheckingHealth,
    autoHideHeader,
    toggleAutoHideHeader,
    users,
    refreshUsers,
    darkMode,
    setDarkMode,
    setShowBulkModal,
    onDeleteSubcategory,
    onSetInputModal,
    currentUser,
    setCurrentUser
}: SettingsTabProps) => {
    const [newUserName, setNewUserName] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const handleAddUser = async () => {
        if (!newUserName.trim()) return;
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newUserName.trim() })
            });
            if (res.ok) {
                setNewUserName('');
                setIsAddingUser(false);
                refreshUsers();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`/api/users?id=${userToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                refreshUsers();
                setUserToDelete(null);
            }
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <div className="pt-4 px-4 pb-4 animate-in slide-in-from-right-10">
            {settingsTab === 'menu' && (
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm dark:text-white">Gestión de Usuarios</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sesión: <span className="text-blue-600 dark:text-blue-400">{currentUser}</span></div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddingUser(!isAddingUser)}
                                className={`p-2 rounded-full transition-colors ${isAddingUser ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}
                            >
                                {isAddingUser ? <X size={20} /> : <UserPlus size={20} />}
                            </button>
                        </div>

                        {isAddingUser && (
                            <div className="flex gap-2 animate-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                    placeholder="Nombre del usuario..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                                <button onClick={handleAddUser} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-500/20"><Plus size={20} /></button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {users.map(user => {
                                const isMe = user.name === currentUser;
                                return (
                                    <div key={user.id} className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border transition-all ${isMe ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                        <button
                                            onClick={() => setCurrentUser(user.name)}
                                            className={`text-[10px] font-bold flex items-center gap-1.5 ${isMe ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'}`}
                                            title={isMe ? "Tú eres este usuario" : "Cambiar a este usuario"}
                                        >
                                            {isMe && <User size={12} className="fill-current" />}
                                            {user.name}
                                        </button>
                                        {!isMe && (
                                            <button onClick={() => setUserToDelete(user.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Custom Delete Modal */}
                        {userToDelete && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">¿Eliminar usuario?</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer. Se perderán los datos asociados si no se han respaldado.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setUserToDelete(null)}
                                            className="flex-1 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleDeleteUser}
                                            className="flex-1 py-3 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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

                    <button onClick={() => setSettingsTab('validation')} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                            <div className="text-left">
                                <p className="font-bold text-slate-700 dark:text-white text-sm">Validación de Red</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Check de salud y base de datos</p>
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

                    <button onClick={() => setSettingsTab('info')} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-xl group-hover:scale-110 transition-transform">
                                <AlertCircle size={24} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm dark:text-white">Información</div>
                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sobre la App</div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300" />
                    </button>
                </div>
            )}

            {settingsTab === 'themes' && (
                <div className="space-y-4">
                    <button onClick={() => setSettingsTab('menu')} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full w-fit active:scale-95 transition-transform mb-2">
                        <ChevronLeft size={16} /> Volver a Ajustes
                    </button>
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
                        <button
                            onClick={toggleAutoHideHeader}
                            className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${autoHideHeader ? 'bg-slate-900 border-blue-500 shadow-xl' : 'bg-white border-slate-100'}`}
                        >
                            <div className={`p-3 rounded-2xl ${autoHideHeader ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {autoHideHeader ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                            <div className="text-left">
                                <div className={`font-bold text-sm ${autoHideHeader ? 'text-white' : 'text-slate-700'}`}>Ocultar Menú Automáticamente</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">{autoHideHeader ? 'Activado (30 seg)' : 'Desactivado (Siempre visible)'}</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {settingsTab === 'categories' && (
                <div className="animate-in fade-in space-y-4">
                    <button onClick={() => setSettingsTab('menu')} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full w-fit active:scale-95 transition-transform mb-2">
                        <ChevronLeft size={16} /> Volver a Ajustes
                    </button>
                    <button onClick={() => onEditCategory({ id: '', name: '', iconKey: 'home', color: 'bg-slate-100 text-slate-600', subs: [] })} className="fixed bottom-24 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/30 active:scale-95 transition-transform" aria-label="Nueva Categoría">
                        <Plus size={24} strokeWidth={3} />
                    </button>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {categories.map(cat => (
                            <div key={cat.id} className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-2xl ${cat.color.split(' ')[0]} ${cat.color.split(' ')[1]}`}>{ICON_LIB[cat.iconKey]}</div>
                                    <div className="flex-1 font-bold text-sm dark:text-white">{cat.name}</div>
                                    <div className="flex gap-1">
                                        <button onClick={() => onEditCategory(cat)} title="Editar" className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-blue-500 hover:bg-blue-50"><Edit3 size={14} /></button>
                                        <button onClick={() => onDeleteCategory(cat.id)} title="Eliminar" className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 ml-2">
                                    {cat.subs.map(sub => (
                                        <div key={sub} className="group relative text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 transition-colors cursor-default">
                                            {sub}
                                            <button
                                                onClick={() => onDeleteSubcategory(cat.id, sub)}
                                                className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                title="Eliminar Subcategoría"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        onSetInputModal({ open: true, title: `Nueva subcategoría en ${cat.name}`, placeholder: "Nombre...", value: "", catId: cat.id });
                                    }} className="text-[10px] border border-dashed border-slate-300 text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-50 hover:text-blue-500 hover:border-blue-300 transition-colors">+ Agregar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VALIDATION TAB */}
            {settingsTab === 'validation' && (
                <div className="space-y-6 animate-in slide-in-from-right-10">
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => setSettingsTab('menu')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Validación de Red</h2>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-white">Estado del Servidor</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Conectividad en Tiempo Real</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${healthStatus?.status === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {healthStatus?.status?.toUpperCase() || 'DESCONOCIDO'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Database size={14} className="text-blue-500" />
                                        <span className="text-xs font-bold dark:text-white">Base de Datos</span>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${healthStatus?.database === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-400 uppercase font-bold">Respuesta</span>
                                        <span className="font-mono font-bold dark:text-slate-300">{healthStatus?.latency || '--'}</span>
                                    </div>
                                    {healthStatus?.error && (
                                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <p className="text-[10px] text-red-600 dark:text-red-400 font-mono leading-relaxed break-all">
                                                {healthStatus.error}
                                                {healthStatus.prismaError && <span className="block mt-1 opacity-60">Prisma Code: {healthStatus.prismaError}</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Cpu size={14} className="text-indigo-500" />
                                    <span className="text-xs font-bold dark:text-white">Entorno</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-400 uppercase font-bold">Node Env</span>
                                        <span className="font-mono font-bold dark:text-slate-300">{healthStatus?.env?.node_env || '--'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-400 uppercase font-bold">DB URL Configurada</span>
                                        <span className={`font-bold ${healthStatus?.env?.db_url_set ? 'text-green-500' : 'text-red-500'}`}>{healthStatus?.env?.db_url_set ? 'SÍ' : 'NO'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => checkHealth()}
                            disabled={isCheckingHealth}
                            className={`w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${isCheckingHealth ? 'opacity-50' : ''}`}
                        >
                            {isCheckingHealth ? <Repeat size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {isCheckingHealth ? 'Validando...' : 'Re-validar Conexión'}
                        </button>
                    </div>

                </div>
            )}

            {settingsTab === 'info' && (
                <div className="space-y-4">
                    <button onClick={() => setSettingsTab('menu')} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full w-fit active:scale-95 transition-transform">
                        <ChevronLeft size={16} /> Volver a Ajustes
                    </button>

                    <div className="flex flex-col items-center justify-center space-y-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 py-12 border border-slate-100 dark:border-slate-800 shadow-xl animate-in zoom-in-95 duration-500">
                        <div className="relative group">
                            <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                            <div className="relative z-10 w-24 h-24 flex items-center justify-center translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                                <img src="/logo_192.png" alt="App Logo" className="w-24 h-24 object-contain scale-125" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Finanzas App</h3>
                            <div className="flex items-center justify-center gap-2">
                                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                                    <Heart size={12} className="fill-current" />
                                    <span className="text-[9px] font-black uppercase tracking-tight">Premium v1.3.1</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[11px] font-bold text-slate-500 text-center px-8">
                                    Software desarrollado para el control inteligente de ingresos y gastos familiares.
                                </p>
                                <div className="flex gap-4 mt-2">
                                    <a
                                        href="https://github.com/danielvasquez507/Finanzas-Vasquez"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                    >
                                        <Github size={20} />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/danielvasquez507"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all outline-none"
                                    >
                                        <Linkedin size={20} />
                                    </a>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl w-full text-center border border-slate-100 dark:border-slate-800 backdrop-blur-sm relative overflow-hidden group/card">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-30 transition-opacity">
                                        <Heart size={40} className="text-blue-500 fill-current" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 opacity-60">Creado con ❤️ por</p>
                                    <p className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">Daniel Vásquez</p>
                                    <p className="text-[9px] text-blue-500 dark:text-blue-400 mt-3 font-black uppercase tracking-tighter">Vibe Coding Profesional</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default SettingsTab;
