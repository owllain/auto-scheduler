/**
 * @file store/useScheduleStore.ts
 * @description Gestión de estado global de la aplicación utilizando Zustand.
 * Maneja la persistencia en memoria de agentes, turnos y la navegación general.
 */

import { create } from 'zustand';
import type { ScheduleState } from '../types';

/**
 * Hook personalizado useScheduleStore.
 * Centraliza la lógica de manipulación de datos para evitar efectos secundarios en componentes individuales.
 */
export const useScheduleStore = create<ScheduleState>((set) => ({
    // ESTADO INICIAL
    agents: [],         // Lista vacía de asesores
    shifts: [],         // Lista vacía de turnos procesados
    weekStart: new Date(), // Fecha actual como punto de referencia
    currentView: 'templates', // Vista por defecto (Cogeneración de plantillas)

    // ACCIONES (MÉTODOS DE ACTUALIZACIÓN)

    /** Establece la fecha de inicio de la semana de planificación */
    setWeekStart: (date) => set({ weekStart: date }),

    /** Cambia la vista activa de la aplicación (SPA navigation) */
    setCurrentView: (view) => set({ currentView: view }),

    /** 
     * Carga y ordena la lista de agentes alfabéticamente por nombre.
     * Esto asegura consistencia visual en todas las tablas y reportes.
     */
    setAgents: (agents) => set({
        agents: agents.sort((a, b) => a.name.localeCompare(b.name))
    }),

    /** Añade un turno individual a la colección actual */
    addShift: (shift) => set((state) => ({
        shifts: [...state.shifts, shift]
    })),

    /** 
     * Actualiza un turno existente identificado por su ID único.
     * Permite actualizaciones parciales (Partial<Shift>).
     */
    updateShift: (id, updates) => set((state) => ({
        shifts: state.shifts.map((s) =>
            s.id === id ? { ...s, ...updates } : s
        )
    })),

    /** 
     * Inserta un turno o lo actualiza si ya existe para un agente en un día específico.
     * Lógica "upsert" crítica para evitar duplicidad de registros en una misma fecha.
     */
    upsertShift: (incomingShift) => set((state) => {
        // Buscamos si ya existe un turno para este agente el mismo día
        const exists = state.shifts.find(s =>
            (s.id === incomingShift.id) ||
            (s.agentId === incomingShift.agentId && s.dayIndex === incomingShift.dayIndex)
        );

        if (exists) {
            // Si existe, reemplazamos los datos manteniendo el ID original si es necesario
            return {
                shifts: state.shifts.map(s =>
                    (s.agentId === incomingShift.agentId && s.dayIndex === incomingShift.dayIndex)
                        ? { ...incomingShift, id: s.id }
                        : s
                )
            };
        } else {
            // Si no existe, lo agregamos como nuevo registro
            return { shifts: [...state.shifts, incomingShift] };
        }
    }),

    /** Reinicia la base de datos de turnos de la sesión actual */
    clearShifts: () => set({ shifts: [] }),
}));