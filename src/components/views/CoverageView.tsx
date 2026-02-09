import React, { useMemo, useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { ShieldCheck, Calendar, Users, AlertCircle, Clock } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { GlassCard } from '../ui/GlassCard';
import { MacBadge } from '../ui/MacBadge';

export const CoverageView: React.FC = () => {
    const { agents, shifts, weekStart } = useScheduleStore();
    const [selectedSkill, setSelectedSkill] = useState<string>("");

    // Normalización de texto (basado en el snippet del usuario)
    const normalize = (text: string) => {
        if (!text) return "";
        return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    };

    // Skills únicos presentes en los agentes
    const allSkills = useMemo(() => {
        const skillsSet = new Set<string>();
        agents.forEach(agent => {
            agent.skills.forEach(skill => skillsSet.add(skill));
        });
        return Array.from(skillsSet).sort();
    }, [agents]);

    // Fechas de la semana
    const weekDays = useMemo(() => {
        const base = typeof weekStart === 'string' ? parseISO(weekStart) : weekStart;
        return Array.from({ length: 7 }, (_, i) => {
            const date = addDays(base, i);
            return {
                dateStr: format(date, 'yyyy-MM-dd'),
                label: format(date, "EEEE d 'de' MMMM", { locale: es }),
                shortLabel: format(date, 'dd/MM'),
                index: i
            };
        });
    }, [weekStart]);

    // Utilidades de tiempo decimal (snippet del usuario)
    const timeToDecimal = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h + (m / 60);
    };

    const formatDecimalTime = (decimal: number) => {
        const h = Math.floor(decimal);
        const m = Math.round((decimal - h) * 60);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m < 10 ? '0' : ''}${m} ${ampm}`;
    };

    // Lógica de filtrado y cálculo de cobertura
    const getFilteredDataForDate = (dayIndex: number) => {
        const isApertura = selectedSkill === "SPECIAL_APERTURA";
        const isCierre = selectedSkill === "SPECIAL_CIERRE";
        const normSelectedSkill = normalize(selectedSkill);

        let filteredAgents = agents;

        if (!isApertura && !isCierre && selectedSkill !== "") {
            filteredAgents = agents.filter(a =>
                a.skills.some(s => normalize(s) === normSelectedSkill)
            );
        }

        return filteredAgents.map(agent => {
            const shift = shifts.find(s => s.agentId === agent.id && s.dayIndex === dayIndex);

            // Si es filtro especial, validamos el horario
            let meetsCriteria = true;
            if (isApertura) {
                const startDec = shift ? timeToDecimal(shift.start) : 0;
                meetsCriteria = !!shift && (startDec >= 6 && startDec <= 7.99);
            } else if (isCierre) {
                const startDec = shift ? timeToDecimal(shift.start) : 0;
                meetsCriteria = !!shift && (startDec >= 13);
            }

            return {
                ...agent,
                shift,
                visible: meetsCriteria
            };
        }).filter(a => a.visible);
    };

    // Renderizado de la barra (06:00 - 22:00)
    const renderTimeline = (startStr: string, endStr: string) => {
        const start = timeToDecimal(startStr);
        const end = timeToDecimal(endStr);
        const rangeStart = 6;
        const rangeEnd = 22;
        const totalHours = rangeEnd - rangeStart;

        let s = Math.max(start, rangeStart);
        let e = Math.min(end, rangeEnd);

        if (end < start) e = rangeEnd;
        if (end > rangeEnd) e = rangeEnd;

        let left = ((s - rangeStart) / totalHours) * 100;
        let width = ((e - s) / totalHours) * 100;

        return { left: `${left}%`, width: `${width}%` };
    };


    if (shifts.length === 0) {
        return (
            <GlassCard className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-[#007AFF] mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No hay datos cargados</h3>
                <p className="text-slate-500 mt-2">Carga una programación en la vista principal para validar coberturas.</p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header / Filtros */}
            <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-[#007AFF] text-white p-2 rounded-xl shadow-lg shadow-blue-500/30">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Revisor de Coberturas</h2>
                        <p className="text-xs text-slate-500">Visualización de líneas de tiempo por skill</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="relative w-full md:w-72 group">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                        <select
                            className="pl-10 w-full py-2 border border-slate-200/60 rounded-lg bg-white/50 backdrop-blur-sm text-sm focus:ring-2 focus:ring-[#007AFF]/30 outline-none shadow-sm font-medium appearance-none hover:bg-white/80 transition-colors"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                        >
                            <option value="">-- Seleccionar Cobertura --</option>
                            <optgroup label="Turnos Especiales">
                                <option value="SPECIAL_APERTURA">⭐ Apertura (06:00 - 08:00)</option>
                                <option value="SPECIAL_CIERRE">🌙 Cierre (13:00 - 15:00+)</option>
                            </optgroup>
                            <optgroup label="Habilidades / Skills">
                                {allSkills.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                </div>
            </GlassCard>

            {selectedSkill === "" ? (
                <GlassCard className="text-center py-20 border-dashed border-slate-300/50 bg-white/40">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600">Selecciona una cobertura</h3>
                    <p className="text-slate-400 text-sm">Elige un skill o turno arriba para ver el despliegue de personal.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {weekDays.map(day => {
                        const dayData = getFilteredDataForDate(day.index);
                        const activeCount = dayData.length;

                        return (
                            <GlassCard key={day.dateStr} className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/60">
                                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/80 border border-slate-200/50 text-slate-700 px-3 py-1 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#007AFF]" />
                                            <span className="capitalize">{day.label}</span>
                                        </div>
                                    </div>
                                    <MacBadge variant="info" className="flex items-center gap-2">
                                        <Users className="w-3 h-3" /> {activeCount} Asesores
                                    </MacBadge>
                                </div>

                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-[10px] text-slate-400 uppercase tracking-widest bg-white/30 border-b border-slate-100/50">
                                                <th className="px-6 py-3 text-left font-bold w-1/4">Nombre del Asesor</th>
                                                <th className="px-4 py-3 text-center font-bold w-24">Inicio</th>
                                                <th className="px-4 py-3 text-center font-bold w-24">Fin</th>
                                                <th className="px-6 py-3 text-left font-bold">Timeline (06:00 - 22:00)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50/50">
                                            {dayData.map((agent, idx) => (
                                                <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-slate-700 text-sm">{agent.name}</span>
                                                        <div className="flex gap-1 mt-1 flex-wrap">
                                                            {agent.skills.slice(0, 3).map(s => (
                                                                <span key={s} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">{s.split(' ')[0]}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-mono text-xs text-slate-500">{agent.shift?.start}</td>
                                                    <td className="px-4 py-4 text-center font-mono text-xs text-slate-500">{agent.shift?.end}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="relative h-8 w-full bg-slate-100/50 rounded-lg overflow-hidden border border-slate-200/50 shadow-inner">
                                                            {/* Grid de Horas (8 divisiones) */}
                                                            <div className="absolute inset-0 flex opacity-50">
                                                                {[...Array(8)].map((_, i) => (
                                                                    <div key={i} className="flex-1 border-r border-slate-200 last:border-0"></div>
                                                                ))}
                                                            </div>
                                                            {/* Barra de Tiempo */}
                                                            <div
                                                                className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-[#007AFF] to-indigo-500 rounded-md shadow-sm group-hover:brightness-110 transition-all cursor-help"
                                                                style={renderTimeline(agent.shift?.start || "0", agent.shift?.end || "0")}
                                                                title={`${formatDecimalTime(timeToDecimal(agent.shift?.start || "0"))} - ${formatDecimalTime(timeToDecimal(agent.shift?.end || "0"))}`}
                                                            >
                                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {dayData.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/10">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Clock className="w-5 h-5 opacity-20" />
                                                            <span>No hay personal en este día para la categoría seleccionada</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
