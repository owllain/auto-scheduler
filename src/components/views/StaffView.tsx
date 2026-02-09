import React from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { User, Shield, Briefcase } from 'lucide-react';

export const StaffView: React.FC = () => {
    const { agents } = useScheduleStore();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Directorio de Asesores</h2>
                    <p className="text-slate-500 text-sm">Gestiona la base de datos de personal activo.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-2xl">
                    {agents.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map(agent => (
                    <div key={agent.id} className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-blue-300">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 truncate" title={agent.name}>{agent.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <span className="font-mono bg-slate-100 px-1 rounded">ID: {agent.id}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {agent.supervisor.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Skills Asignados</p>
                            <div className="flex flex-wrap gap-1.5">
                                {agent.skills.map(skill => (
                                    <span key={skill} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-600 group-hover:border-blue-100">
                                        <Shield className="w-3 h-3 text-slate-400" /> {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};