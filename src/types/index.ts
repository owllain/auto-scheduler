/**
 * @file types/index.ts
 * @description Definiciones de tipos y modelos de datos centrales para la aplicación de gestión de horarios.
 * Aquí se centralizan las interfaces de Agentes, Turnos y el Estado Global.
 */

/**
 * Tipos de turnos permitidos en el sistema.
 * Se usan para categorizar las jornadas y facilitar el filtrado de coberturas.
 */
export type ShiftType = 'Apertura' | 'Cierre' | 'Standard' | 'Tarde' | 'Descanso' | 'Novedad' | 'Extra';

/**
 * Representa a un agente (asesor) dentro del sistema.
 */
export interface Agent {
    id: string;             // Identificador único (LogID o Cédula)
    name: string;           // Nombre completo del asesor
    supervisor: string;     // Nombre del supervisor a cargo
    skills: string[];       // Lista de habilidades o colas (ej: "800 Tarjetas", "Visa")
    rotationGroup?: string; // Grupo de rotación (opcional)
    fixedShift?: string;    // Horario fijo si aplica (opcional)
    tags?: string[];        // Etiquetas adicionales para filtrado rápido
}

/**
 * Representa un turno individual asignado a un agente en un día específico.
 */
export interface Shift {
    id: string;             // ID único del turno (auto-generado o mapping)
    agentId: string;        // ID del agente al que pertenece
    dayIndex: number;       // Día de la semana (0 = Lunes, 6 = Domingo)
    date: string;           // Fecha en formato ISO (YYYY-MM-DD)
    start: string;          // Hora de inicio (ej: "06:00")
    end: string;            // Hora de fin (ej: "14:00")
    type: ShiftType;        // Categoría del turno (Apertura, Cierre, etc.)
    isLocked: boolean;      // Indica si el turno está protegido contra cambios automáticos
    notes?: string;         // Observaciones adicionales o tipo de novedad
}

/**
 * Interfaz que define la estructura y acciones del estado global (Zustand).
 */
export interface ScheduleState {
    agents: Agent[];        // Lista de agentes cargados en memoria
    shifts: Shift[];        // Lista de turnos procesados
    weekStart: Date;        // Fecha de inicio de la semana de planificación
    currentView: ViewOption; // Vista activa en la navegación principal

    // Acciones para modificar el estado
    setWeekStart: (date: Date) => void;
    setCurrentView: (view: ViewOption) => void;
    setAgents: (agents: Agent[]) => void;
    addShift: (shift: Shift) => void;
    updateShift: (id: string, updates: Partial<Shift>) => void;
    upsertShift: (shift: Shift) => void;
    clearShifts: () => void;
}

/**
 * Opciones de navegación disponibles en la aplicación.
 */
export type ViewOption = 'config' | 'templates' | 'scheduleMaker';