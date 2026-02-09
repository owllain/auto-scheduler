import React from 'react';
import { LayoutDashboard, Users, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useScheduleStore } from '../../store/useScheduleStore';
// CORRECCIÓN: Importar desde types
import type { ViewOption } from '../../types';

export const Sidebar: React.FC = () => {
    const { currentView, setCurrentView } = useScheduleStore();

    const MenuItem = ({ view, icon: Icon, label }: { view: ViewOption, icon: React.ElementType, label: string }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-1 text-sm font-medium
        ${currentView === view
                    ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-500 hover:bg-black/5 hover:text-slate-900 active:bg-black/10'}`}
        >
            <Icon className={`w-4 h-4 ${currentView === view ? 'text-white' : 'text-slate-400'}`} />
            <span>{label}</span>
        </button>
    );

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col z-50 bg-white/60 backdrop-blur-xl border-r border-white/20 shadow-2xl">
            {/* Window Controls Dummy */}
            <div className="p-6 pb-2 flex items-center gap-2 mb-2 opactiy-80 group hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/50 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]/50 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/50 shadow-inner"></div>
            </div>

            <div className="px-6 py-2 mb-6">
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-slate-800 leading-tight tracking-tight">AutoScheduler</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Netcom BP</span>
                </div>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto space-y-6">
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Principal</div>
                    <MenuItem view="dashboard" icon={LayoutDashboard} label="Programación" />
                    <MenuItem view="coverage" icon={ShieldCheck} label="Coberturas" />
                    <MenuItem view="staff" icon={Users} label="Asesores & Skills" />
                </div>

                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Sistema</div>
                    <MenuItem view="config" icon={Settings} label="Configuración" />
                </div>
            </nav>

            <div className="p-4 border-t border-white/10 bg-white/30 backdrop-blur-md">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50/50 group text-sm font-medium">
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};
