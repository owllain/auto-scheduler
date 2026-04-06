import React, { useEffect } from 'react';
import { X, Save, Trash2, Clock, Zap } from 'lucide-react';
import type { Shift, ShiftType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface ShiftEditorProps {
    shift?: Shift; // Ahora es opcional (puede ser nuevo)
    agentId: string;
    agentName: string;
    dayDate: string; // Necesitamos la fecha para crear uno nuevo
    dayIndex: number;
    onClose: () => void;
    onSave: (shift: Shift) => void; // onSave ahora recibe el objeto completo
}

export const ShiftEditor: React.FC<ShiftEditorProps> = ({
    shift, agentId, agentName, dayDate, dayIndex, onClose, onSave
}) => {
    // Valores iniciales (si existe el turno, usalos; si no, default 8-5)
    const [start, setStart] = React.useState(shift?.start || '08:00');
    const [end, setEnd] = React.useState(shift?.end || '17:00');
    const [notes, setNotes] = React.useState(shift?.notes || '');
    const [type, setType] = React.useState<ShiftType>(shift?.type || 'Standard');

    // Detectar tipo automáticamente al cambiar horas
    useEffect(() => {
        if (start === '00:00' && end === '00:00') setType('Descanso');
        else if (start.startsWith('06')) setType('Apertura');
        else if (start.startsWith('07')) setType('Standard');
        else if (start.startsWith('13')) setType('Tarde');
        else if (start.startsWith('15')) setType('Cierre');
    }, [start, end]);

    const handleSave = () => {
        const shiftToSave: Shift = {
            id: shift?.id || uuidv4(), // Si no tiene ID, creamos uno
            agentId,
            dayIndex,
            date: dayDate,
            start,
            end,
            type,
            isLocked: false,
            notes
        };
        onSave(shiftToSave);
        onClose();
    };

    const handleSetLibre = () => {
        setStart('00:00');
        setEnd('00:00');
        setType('Descanso');
        setNotes('Libre Asignado');
    };

    // Función para aplicar presets rápidos
    const applyPreset = (s: string, e: string, t: ShiftType) => {
        setStart(s);
        setEnd(e);
        setType(t);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[450px] p-6 transform transition-all scale-100">

                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Gestionar Jornada</h3>
                        <p className="text-xs text-slate-500">{agentName} • {dayDate}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Botones de Jornada Rápida (PRESETS) */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> Asignación Rápida
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => applyPreset('06:00', '14:00', 'Apertura')} className="text-xs py-2 px-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition">Apertura (6-14)</button>
                        <button onClick={() => applyPreset('07:00', '15:00', 'Standard')} className="text-xs py-2 px-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition">Mañana (7-15)</button>
                        <button onClick={() => applyPreset('08:00', '19:00', 'Standard')} className="text-xs py-2 px-1 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition">Estándar (8-17)</button>
                        <button onClick={() => applyPreset('13:00', '20:00', 'Tarde')} className="text-xs py-2 px-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 transition">Tarde (13-20)</button>
                        <button onClick={() => applyPreset('15:00', '22:00', 'Cierre')} className="text-xs py-2 px-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition">Cierre (15-22)</button>
                        <button onClick={handleSetLibre} className="text-xs py-2 px-1 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition">LIBRE</button>
                    </div>
                </div>

                {/* Inputs Manuales (24H) */}
                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1 flex gap-1"><Clock className="w-3 h-3" /> Entrada (24h)</label>
                            <input
                                type="time"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1 flex gap-1"><Clock className="w-3 h-3" /> Salida (24h)</label>
                            <input
                                type="time"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Observación / Excepción</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Permiso médico, Vacaciones..."
                            className="w-full border border-slate-300 rounded p-2 text-sm"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSetLibre}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Marcar Libre
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                    >
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};