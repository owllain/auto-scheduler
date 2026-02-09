import React, { useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { addDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getShiftColor, getShiftLabel } from '../../utils/shiftUtils';
import { getSupervisorStyle } from '../../utils/styleUtils';
// Aseguramos que se usen estos iconos en el return
import { Clock, User, Search, Filter, Plus } from 'lucide-react';
import { ShiftEditor } from './ShiftEditor';
import type { Shift } from '../../types';

const SkillBadge = ({ skill }: { skill: string }) => {
    return <span className="text-[9px] bg-slate-100 px-1 rounded truncate max-w-[50px]">{skill.substring(0, 3)}</span>;
};

export const ScheduleGrid: React.FC = () => {
    const { agents, shifts, weekStart, upsertShift } = useScheduleStore();
    const startDate = typeof weekStart === 'string' ? parseISO(weekStart) : weekStart;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterShift, setFilterShift] = useState('all');

    const [editorContext, setEditorContext] = useState<{
        shift?: Shift,
        agentId: string,
        agentName: string,
        dayIndex: number,
        dayDate: string
    } | null>(null);

    const filteredAgents = agents.filter(agent => {
        if (!agent.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterShift !== 'all') {
            const agentShifts = shifts.filter(s => s.agentId === agent.id);
            return agentShifts.some(s => s.type === filterShift);
        }
        return true;
    });

    const getShiftForAgent = (agentId: string, dayIndex: number) => {
        return shifts.find(s => s.agentId === agentId && s.dayIndex === dayIndex);
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startDate, i);
        return {
            index: i,
            label: format(date, 'EEEE', { locale: es }),
            dateStr: format(date, 'dd/MM'),
            fullDate: format(date, 'yyyy-MM-dd'),
            isWeekend: i === 5 || i === 6
        };
    });

    const handleCellClick = (agentId: string, agentName: string, dayIndex: number, dateStr: string, shift?: Shift) => {
        setEditorContext({ shift, agentId, agentName, dayIndex, dayDate: dateStr });
    };

    return (
        <div className="space-y-4">
            {/* BARRA DE FILTROS - AQUÍ USAMOS SEARCH Y FILTER */}
            <div className="flex gap-4 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar asesor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="relative w-48">
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <select
                        value={filterShift}
                        onChange={(e) => setFilterShift(e.target.value)}
                        className="pl-9 w-full py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">Todas las Jornadas</option>
                        <option value="Apertura">Solo Aperturas</option>
                        <option value="Standard">Solo Estándar</option>
                        <option value="Cierre">Solo Cierres</option>
                    </select>
                </div>

                <div className="ml-auto text-xs text-slate-400">
                    {filteredAgents.length} asesores
                </div>
            </div>

            {/* TABLA GRID */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-20">
                <div className="grid grid-cols-[250px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    {/* HEADER AGENTE - AQUÍ USAMOS USER */}
                    <div className="p-4 font-semibold text-slate-700 flex items-center gap-2 bg-slate-50">
                        <User className="w-4 h-4" /> Agente
                    </div>
                    {weekDays.map((day) => (
                        <div key={day.index} className={`p-3 text-center border-l border-slate-200 ${day.isWeekend ? 'bg-slate-100' : ''}`}>
                            <div className="capitalize font-bold text-slate-700 text-sm">{day.label}</div>
                            <div className="text-xs text-slate-500">{day.dateStr}</div>
                        </div>
                    ))}
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredAgents.map((agent) => (
                        <div key={agent.id} className="grid grid-cols-[250px_repeat(7,1fr)] hover:bg-blue-50/30 transition-colors group">

                            <div className={`p-3 flex flex-col justify-center bg-white border-r border-slate-100 relative ${getSupervisorStyle(agent.supervisor)}`}>
                                <span className="font-semibold text-sm text-slate-800 truncate" title={agent.name}>
                                    {agent.name}
                                </span>
                                <span className="text-[10px] text-slate-400 mb-1 truncate">{agent.supervisor}</span>
                                <div className="flex flex-wrap gap-1">
                                    {agent.skills.slice(0, 3).map(s => <SkillBadge key={s} skill={s} />)}
                                </div>
                            </div>

                            {weekDays.map((day) => {
                                const shift = getShiftForAgent(agent.id, day.index);
                                return (
                                    <div key={`${agent.id}-${day.index}`} className={`border-l border-slate-100 p-1 min-h-[50px] ${day.isWeekend ? 'bg-slate-50/30' : ''}`}>
                                        {shift ? (
                                            <div
                                                onClick={() => handleCellClick(agent.id, agent.name, day.index, day.fullDate, shift)}
                                                className={`h-full w-full rounded p-1 text-xs flex flex-col items-center justify-center border cursor-pointer hover:scale-[1.05] transition-all select-none ${getShiftColor(shift.type)}`}
                                            >
                                                <span className="font-bold text-[11px] leading-tight text-center">{getShiftLabel(shift.start, shift.end, shift.type)}</span>
                                            </div>
                                        ) : (
                                            // CELDA VACÍA - AQUÍ USAMOS PLUS O CLOCK
                                            <div
                                                onClick={() => handleCellClick(agent.id, agent.name, day.index, day.fullDate)}
                                                className="h-full w-full rounded flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-slate-200 transition-all"
                                            >
                                                <Plus className="w-4 h-4 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {editorContext && (
                <ShiftEditor
                    shift={editorContext.shift}
                    agentId={editorContext.agentId}
                    agentName={editorContext.agentName}
                    dayDate={editorContext.dayDate}
                    dayIndex={editorContext.dayIndex}
                    onClose={() => setEditorContext(null)}
                    onSave={upsertShift}
                />
            )}
        </div>
    );
};