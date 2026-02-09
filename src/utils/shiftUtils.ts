import type { ShiftType } from "../types";

export const getShiftColor = (type: ShiftType): string => {
    switch (type) {
        case 'Apertura':
            return 'bg-amber-100 text-amber-800 border-amber-200'; // Amarillito amanecer
        case 'Cierre':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200'; // Azul noche
        case 'Tarde':
            return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'Novedad':
            return 'bg-red-100 text-red-800 border-red-200'; // Alerta
        case 'Descanso':
            return 'bg-slate-100 text-slate-400';
        case 'Standard':
        default:
            return 'bg-white text-slate-600 border-slate-200';
    }
};

export const getShiftLabel = (start: string, end: string, type: ShiftType): string => {
    if (type === 'Novedad') return 'NOVEDAD';
    if (type === 'Descanso') return 'LIBRE';
    return `${start} - ${end}`;
};