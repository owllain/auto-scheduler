import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const downloadTemplateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Plantilla Carga');

    // Definición de columnas según el formato esperado por excelLoader.ts
    // Col A (0): Supervisor
    // Col B (1): LOG ID
    // Col C (2): Nombre
    // Col D (3) -> J (9): Lunes -> Domingo
    // Col K (10): Observaciones
    sheet.columns = [
        { header: 'Supervisor', key: 'supervisor', width: 20 },
        { header: 'LOG ID', key: 'logid', width: 15 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Lunes', key: 'lunes', width: 12 },
        { header: 'Martes', key: 'martes', width: 12 },
        { header: 'Miércoles', key: 'miercoles', width: 12 },
        { header: 'Jueves', key: 'jueves', width: 12 },
        { header: 'Viernes', key: 'viernes', width: 12 },
        { header: 'Sábado', key: 'sabado', width: 12 },
        { header: 'Domingo', key: 'domingo', width: 12 },
        { header: 'Observaciones', key: 'obs', width: 25 }
    ];

    // Estilo del encabezado
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF444444' } };
    headerRow.alignment = { horizontal: 'center' };

    // Añadir una fila de ejemplo
    sheet.addRow({
        supervisor: 'Enrique',
        logid: '113021',
        nombre: 'David Vega',
        lunes: '06 a 14',
        martes: '06 a 14',
        miercoles: '06 a 14',
        jueves: '06 a 14',
        viernes: '06 a 14',
        sabado: 'Descanso',
        domingo: 'Descanso',
        obs: 'Ejemplo de carga'
    });

    // Añadir validación de datos / Comentario de ayuda (opcional, pero ayuda)
    sheet.addConditionalFormatting({
        ref: 'D2:J100',
        rules: [
            {
                type: 'containsText',
                operator: 'containsText',
                text: 'Descanso',
                priority: 1,
                style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFEE2E2' } } }
            }
        ]
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Plantilla_AutoScheduler.xlsx`);
};
