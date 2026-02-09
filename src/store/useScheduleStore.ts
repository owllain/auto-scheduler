import { create } from 'zustand';
// Importamos ViewOption desde types
import type { ScheduleState, Agent, Shift, ViewOption } from '../types';
import staffData from '../data/staff.json';

// Ordenamos agentes
const sortedAgents = (staffData as Agent[]).sort((a, b) =>
    a.name.localeCompare(b.name)
);

export const useScheduleStore = create<ScheduleState>((set) => ({
    agents: sortedAgents,
    shifts: [],
    weekStart: new Date(),
    currentView: 'dashboard',

    setWeekStart: (date) => set({ weekStart: date }),
    setCurrentView: (view) => set({ currentView: view }),

    setAgents: (agents) => set({
        agents: agents.sort((a, b) => a.name.localeCompare(b.name))
    }),

    addShift: (shift) => set((state) => ({
        shifts: [...state.shifts, shift]
    })),

    updateShift: (id, updates) => set((state) => ({
        shifts: state.shifts.map((s) =>
            s.id === id ? { ...s, ...updates } : s
        )
    })),

    upsertShift: (incomingShift) => set((state) => {
        const exists = state.shifts.find(s =>
            (s.id === incomingShift.id) ||
            (s.agentId === incomingShift.agentId && s.dayIndex === incomingShift.dayIndex)
        );

        if (exists) {
            return {
                shifts: state.shifts.map(s =>
                    (s.agentId === incomingShift.agentId && s.dayIndex === incomingShift.dayIndex)
                        ? { ...incomingShift, id: s.id }
                        : s
                )
            };
        } else {
            return { shifts: [...state.shifts, incomingShift] };
        }
    }),

    clearShifts: () => set({ shifts: [] }),
}));