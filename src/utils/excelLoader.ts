import readXlsxFile from 'read-excel-file';
import type { Shift, Agent, ShiftType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, format } from 'date-fns';
// Se eliminaron 'parse' y 'isValid' porque no los estamos usando aquí

export const parseSupervisorFile = async (file: File, weekStartDate: Date, activeAgents: Agent[]): Promise<Shift[]> => {
    const rows = await readXlsxFile(file);
    const shifts: Shift[] = [];
    const agentMap = new Map(activeAgents.map(a => [a.id, a]));

    // Asumimos que la fila 1 (index 0) son cabeceras. Empezamos en fila 2.
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // EN LA NUEVA PLANTILLA (MACRO):
        // Col A (0): Supervisor
        // Col B (1): LOG ID
        // Col C (2): Nombre
        // Col D (3) -> J (9): Lunes -> Domingo
        // Col K (10): Observaciones

        const logId = row[1]?.toString(); // Columna B es ID ahora

        if (logId && agentMap.has(logId)) {
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                // Leemos columnas 3 a 9 (Lunes a Domingo)
                const cellContent = row[dayIndex + 3]?.toString().toLowerCase().trim();

                if (!cellContent || cellContent === 'libre' || cellContent === 'descanso' || cellContent === '') continue;

                const currentDayDate = addDays(weekStartDate, dayIndex);
                const dateStr = format(currentDayDate, 'yyyy-MM-dd');

                let start = '08:00';
                let end = '17:00';
                let type: ShiftType = 'Standard';
                let isLocked = false;
                let notes = '';

                // --- LÓGICA DE PARSEO NUEVA (Formato "6 a 14") ---

                // 1. Novedades Completas (Texto)
                if (cellContent.includes('vacaciones') || cellContent.includes('incapacidad')) {
                    type = 'Novedad';
                    isLocked = true;
                    notes = cellContent.charAt(0).toUpperCase() + cellContent.slice(1);
                    start = '00:00';
                    end = '00:00';
                }

                // 2. Formato Dropdown "X a Y"
                else if (cellContent.includes(' a ')) {
                    const parts = cellContent.split(' a ');
                    if (parts.length === 2) {
                        let s = parseInt(parts[0].trim());
                        let e = parseInt(parts[1].trim());

                        if (e === 24) e = 23;

                        start = `${s.toString().padStart(2, '0')}:00`;
                        end = `${e.toString().padStart(2, '0')}:00`;

                        // Asignar Tipos
                        if (s <= 6) type = 'Apertura';
                        else if (e >= 21) type = 'Cierre';
                        else if (s >= 13) type = 'Tarde';

                        // CORRECCIÓN: Si termina a las 19, sigue siendo considerado Standard/Tarde según prefieras
                        // Pero como pediste que el estándar sea 8 a 19, lo clasificamos así:
                        else if (s === 8 && e === 19) type = 'Standard';
                        else type = 'Standard';
                    }
                }
                // 3. Fallback a formato viejo "6-14" (Por si acaso)
                else if (cellContent.includes('-')) {
                    const parts = cellContent.split('-');
                    if (parts.length === 2) {
                        start = parts[0].trim().padStart(2, '0') + (parts[0].includes(':') ? '' : ':00');
                        end = parts[1].trim().padStart(2, '0') + (parts[1].includes(':') ? '' : ':00');
                        if (start.startsWith('06')) type = 'Apertura';
                        else if (start.startsWith('15')) type = 'Cierre';
                    }
                }

                // Observaciones (Columna K / index 10)
                const obs = row[10]?.toString();
                if (obs && dayIndex === 0) {
                    notes = obs;
                }

                shifts.push({
                    id: uuidv4(),
                    agentId: logId,
                    dayIndex,
                    date: dateStr,
                    start,
                    end,
                    type,
                    isLocked,
                    notes
                });
            }
        }
    }
    return shifts;
};