export type ShiftType = 'Apertura' | 'Cierre' | 'Standard' | 'Tarde' | 'Descanso' | 'Novedad' | 'Extra';
export interface Agent {
    id: string;
    name: string;
    supervisor: string;
    skills: string[];
    rotationGroup?: string;
    fixedShift?: string;
    tags?: string[];
}

export interface Shift {
    id: string;
    agentId: string;
    dayIndex: number;
    date: string;
    start: string;
    end: string;
    type: ShiftType;
    isLocked: boolean;
    notes?: string;
}

export interface ScheduleState {
    agents: Agent[];
    shifts: Shift[];
    weekStart: Date;
    currentView: ViewOption; // <--- Agregamos esto a la interfaz del estado

    setWeekStart: (date: Date) => void;
    setCurrentView: (view: ViewOption) => void;
    setAgents: (agents: Agent[]) => void;
    addShift: (shift: Shift) => void;
    updateShift: (id: string, updates: Partial<Shift>) => void;
    upsertShift: (shift: Shift) => void;
    clearShifts: () => void;
}

// DEFINICIÓN CENTRALIZADA
export type ViewOption = 'dashboard' | 'staff' | 'config' | 'coverage';