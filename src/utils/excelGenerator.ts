import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ScheduleState } from '../types';
import { format } from 'date-fns';

// Lista de IDs o Nombres clave para Recurrentes
const RECURRENT_AGENTS = [
    '113021', // David Vega
    '113068', // Eva
    '113008', // Daneiker
    '113027', // Ricardo
    '113015', // Veronica
    'Vega Ramirez', 'Agüero Cerdas', 'Marcano', 'Castro Mora', 'Bolaños Salas' // Fallback por apellidos
];

const isRecurrente = (agent: { id: string, name: string }) => {
    if (RECURRENT_AGENTS.includes(agent.id)) return true;
    return RECURRENT_AGENTS.some(key => agent.name.includes(key));
};

export const downloadScheduleExcel = async (store: ScheduleState) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Novedades WFO');

    sheet.columns = [
        { header: '#', key: 'index', width: 5 },
        { header: 'Sub Linea de Negocio', key: 'sublinea', width: 20 },
        { header: 'Nombre', key: 'nombre', width: 35 },
        { header: 'LogID', key: 'logid', width: 15 },
        { header: 'Día de la Excepción', key: 'fecha', width: 18 },
        { header: 'Excepción para', key: 'excepcion', width: 15 },
        { header: 'Inicio', key: 'inicio', width: 10 },
        { header: 'Fin', key: 'fin', width: 10 },
        { header: 'Tipo', key: 'tipo', width: 15 }, // Aquí irá Recurrente/Flotante
        { header: 'Novedad', key: 'novedad', width: 20 },
        { header: 'Observación', key: 'obs', width: 30 }
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF555555' } };
    headerRow.alignment = { horizontal: 'center' };

    let rowIndex = 1;
    const sortedAgents = [...store.agents].sort((a, b) => a.name.localeCompare(b.name));

    sortedAgents.forEach((agent) => {
        const agentShifts = store.shifts.filter(s => s.agentId === agent.id);
        agentShifts.sort((a, b) => a.dayIndex - b.dayIndex);

        // Determinamos si es Recurrente o Flotante
        const contractType = isRecurrente(agent) ? 'Recurrente' : 'Flotante';

        agentShifts.forEach(shift => {
            let novedad = '';
            let inicio = shift.start;
            let fin = shift.end;
            // Mantenemos lógica de excepciones pero usamos contractType en la columna Tipo

            if (shift.type === 'Novedad') {
                novedad = shift.notes || 'Novedad';
                inicio = '';
                fin = '';
            } else if (shift.start === '00:00' || shift.type === 'Descanso') {
                inicio = '';
                fin = '';
            }

            sheet.addRow({
                index: rowIndex++,
                sublinea: 'Banca Fácil',
                nombre: agent.name,
                logid: agent.id,
                fecha: shift.date,
                excepcion: '',
                inicio: inicio,
                fin: fin,
                tipo: contractType, // <--- CAMBIO AQUÍ
                novedad: novedad,
                obs: shift.notes || ''
            });
        });
    });

    const weekStr = store.weekStart ? format(new Date(store.weekStart), 'yyyy-MM-dd') : 'Semana';
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Novedades_WFO_${weekStr}.xlsx`);
};