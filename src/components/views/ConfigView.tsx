import React from 'react';
import { Settings, Clock, Shield, AlertTriangle, Save, RefreshCw, Download, HelpCircle, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { MacButton } from '../ui/MacButton';
import { MacInput } from '../ui/MacInput';
import { MacBadge } from '../ui/MacBadge';

export const ConfigView: React.FC = () => {
    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/Plantilla_Novedades.xlsx';
        link.download = 'Plantilla_AutoScheduler.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-20">

            {/* 1. Header & Actions */}
            <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-slate-500" />
                        Panel de Control
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Configura reglas de negocio, horarios y descarga de herramientas.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <MacButton
                        onClick={handleDownloadTemplate}
                        variant="secondary"
                    >
                        <div className="flex items-center gap-2">
                            <Download className="w-4 h-4" /> Plantilla Excel
                        </div>
                    </MacButton>
                    <MacButton variant="primary">
                        <div className="flex items-center gap-2">
                            <Save className="w-4 h-4" /> Guardar Todo
                        </div>
                    </MacButton>
                </div>
            </GlassCard>

            {/* 2. Guía Paso a Paso */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 overflow-hidden relative">
                <HelpCircle className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-200" /> ¿Cómo usar el Auto-Scheduler?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold mb-3 shadow-sm">1</div>
                        <h4 className="font-bold text-sm mb-1">Prepara la Data</h4>
                        <p className="text-xs text-blue-50 leading-relaxed">Usa la <button onClick={handleDownloadTemplate} className="underline font-bold hover:text-white">Plantilla Excel</button>. Asegúrate de colocar los IDs correctos y horarios en formato "6 a 14".</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold mb-3 shadow-sm">2</div>
                        <h4 className="font-bold text-sm mb-1">Carga en Programación</h4>
                        <p className="text-xs text-blue-50 leading-relaxed">Ve a la pestaña "Programación", selecciona la fecha de inicio (Lunes) y arrastra tu archivo actualizado.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold mb-3 shadow-sm">3</div>
                        <h4 className="font-bold text-sm mb-1">Exportar y Listo</h4>
                        <p className="text-xs text-blue-50 leading-relaxed">Verifica que no haya traslapes en el grid y usa el botón "Exportar Excel" para tu reporte final de WFO.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 3. Definición de Jornadas */}
                <GlassCard className="p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#007AFF]" /> Jornadas Pre-definidas
                        </h3>
                        <MacButton size="sm" variant="ghost" className="text-blue-600">
                            <div className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Defaults
                            </div>
                        </MacButton>
                    </div>

                    <div className="space-y-3 flex-1">
                        {[
                            { label: 'Apertura', start: '06:00', end: '14:00', variant: 'warning' },
                            { label: 'Mañana', start: '07:00', end: '15:00', variant: 'info' },
                            { label: 'Estándar', start: '08:00', end: '19:00', variant: 'neutral' },
                            { label: 'Tarde', start: '13:00', end: '20:00', variant: 'purple' },
                            { label: 'Cierre', start: '15:00', end: '22:00', variant: 'success' },
                        ].map((j, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/80 transition bg-white/40">
                                <div className="w-24">
                                    <MacBadge variant={j.variant as any} className="w-full block text-center py-1">{j.label}</MacBadge>
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <MacInput type="time" defaultValue={j.start} className="w-full text-center" />
                                    <ChevronRight className="w-3 h-3 text-slate-300 hidden md:block" />
                                    <MacInput type="time" defaultValue={j.end} className="w-full text-center" />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* 4. Reglas por Skill */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" /> Horarios por Skill
                        </h3>
                        <div className="bg-amber-50/50 border border-amber-100/50 rounded-lg p-4 mb-5 flex gap-3 backdrop-blur-sm">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-[11px] text-amber-700 leading-snug">
                                Define la cantidad mínima de agentes necesarios por skill para que el sistema marque alertas de cobertura insuficiente.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { skill: 'Visa / Especializados', min: 2, icon: '💳' },
                                { skill: '800 Tarjetas', min: 4, icon: '📞' },
                                { skill: 'Aura / Conexión', min: 3, icon: '🌐' },
                                { skill: 'Cancelaciones', min: 1, icon: '❌' },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/40 rounded-lg border border-slate-100 hover:bg-white/60 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg grayscale opacity-80">{s.icon}</span>
                                        <span className="text-sm font-semibold text-slate-700">{s.skill}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Min:</span>
                                        <MacInput type="number" defaultValue={s.min} className="w-16 text-center font-bold text-blue-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* 5. Otros Formatos */}
                    <GlassCard className="p-6 border-t-4 border-t-green-500">
                        <div className="flex items-center gap-2 mb-4">
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            <h3 className="font-bold text-slate-700">Importación Masiva</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Si ya tienes una lista de asesores fuera del sistema, puedes pegarla en la pestaña <strong>Asesores & Skills</strong> o re-definir los IDs recurrentes aquí:
                        </p>
                        <textarea
                            className="w-full border border-slate-200/60 rounded-lg p-3 text-[11px] font-mono h-20 bg-white/50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-green-500/20 backdrop-blur-sm"
                            placeholder="IDs separados por coma..."
                            defaultValue={`113021, 113068, 113008, 113027, 113015\n# David Vega, Eva María, Daneiker`}
                        />
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
