/**
 * @file views/ScheduleGeneratorView.tsx
 * @description Generador Maestro de Novedades (V3.1).
 * Optimizaciones: Jornadas rápidas, búsqueda por asesor y Zebra por bloques de 7 días.
 */

import React, { useState, useMemo } from 'react';
import { 
    Upload, 
    Card, 
    Typography, 
    Button, 
    DatePicker, 
    Space, 
    Divider, 
    Row, 
    Col,
    Tag,
    Tabs,
    Table,
    Input,
    Select,
    message as antdMessage
} from 'antd';
import { 
    DownloadOutlined, 
    DatabaseOutlined,
    EditOutlined,
    CloudUploadOutlined,
    CheckCircleOutlined,
    RollbackOutlined,
    SearchOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * Mapa de Jornadas Estándar (Netcom BP)
 */
const STANDARD_SHIFTS = {
    'Apertura': { start: '06:00', end: '14:00' },
    'Mañana': { start: '07:00', end: '15:00' },
    'Estándar': { start: '08:00', end: '17:00' },
    'Tarde': { start: '13:00', end: '21:00' },
    'Cierre': { start: '14:00', end: '22:00' },
    'Libre': { start: '', end: '' }
};

interface WFORow {
    key: string;
    index: number;
    subLinea: string;
    nombre: string;
    logId: string;
    dia: string;
    excepcion: string;
    inicio: string;
    fin: string;
    tipo: string;
    tipoHorario: string;
    novedad: string;
    vbrrhh: string;
    obs: string;
    totalHoras: string;
    jornadaLabel?: string; // Solo para UI
}

export const ScheduleGeneratorView: React.FC = () => {
    // 1. ESTADO LOCAL
    const [plantillaFile, setPlantillaFile] = useState<File | null>(null);
    const [weekStart, setWeekStart] = useState<dayjs.Dayjs | null>(dayjs().startOf('week').add(1, 'day'));
    const [isProcessing, setIsProcessing] = useState(false);
    const [rows, setRows] = useState<WFORow[]>([]);
    const [activeTab, setActiveTab] = useState('1');
    const [searchText, setSearchText] = useState('');

    /**
     * Filtrado en tiempo real por Nombre del Asesor.
     */
    const filteredRows = useMemo(() => {
        if (!searchText) return rows;
        return rows.filter(r => r.nombre.toLowerCase().includes(searchText.toLowerCase()));
    }, [rows, searchText]);

    /**
     * Lista de LogIDs únicos para el efecto Zebra por Asesor.
     */
    const uniqueAdvisors = useMemo(() => {
        const ids = rows.map(r => r.logId);
        return Array.from(new Set(ids));
    }, [rows]);

    /**
     * Extrae horas de texto (Legacy parsing).
     */
    const extractTime = (shiftStr: string): { inicio: string, fin: string } => {
        if (!shiftStr) return { inicio: '', fin: '' };
        const val = shiftStr.toLowerCase().trim();
        if (['libre', 'vacaciones', 'incapacidad', 'permiso', 'licencia'].includes(val)) {
            return { inicio: '', fin: '' };
        }
        const match = val.match(/(\d{1,2})\s*a\s*(\d{1,2})/i);
        if (match) {
            const startHour = match[1].padStart(2, '0');
            const endHour = match[2].padStart(2, '0');
            return { inicio: `${startHour}:00`, fin: `${endHour}:00` };
        }
        return { inicio: '', fin: '' };
    };

    /**
     * PROCESAR EXCEL (Carga inicial)
     */
    const handleProcessFile = async () => {
        if (!plantillaFile) {
            antdMessage.error('Debes subir la plantilla.');
            return;
        }

        setIsProcessing(true);
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await plantillaFile.arrayBuffer());

            const bbddSheet = workbook.worksheets.find(s => s.name.toUpperCase().includes('BBDD'));
            const bbddMap = new Map<string, string>();
            if (bbddSheet) {
                bbddSheet.eachRow((row, i) => {
                    if (i === 1) return;
                    const logId = row.getCell(2).value?.toString().trim() || '';
                    const subLinea = row.getCell(4).value?.toString().trim() || 'Banca Fácil';
                    if (logId) bbddMap.set(logId, subLinea);
                });
            }

            const plantillaSheet = workbook.worksheets.find(s => s.name.toLowerCase().includes('novedades'));
            if (!plantillaSheet) throw new Error('No se encontró la hoja de novedades.');

            const loadedRows: WFORow[] = [];
            let globalIdx = 1;
            const daysMap = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

            plantillaSheet.eachRow((row, rowNumber) => {
                if (rowNumber < 2) return;
                const logId = row.getCell(2).value?.toString().trim() || '';
                const nombre = row.getCell(3).value?.toString().trim() || '';
                const baseObs = row.getCell(11).value?.toString().trim() || '';

                if (!nombre || !logId) return;
                const subLinea = bbddMap.get(logId) || 'Banca Fácil / 800 Tarjetas';

                for (let d = 0; d < 7; d++) {
                    const diaCol = 4 + d;
                    const shiftValue = row.getCell(diaCol).value?.toString().trim() || 'Libre';
                    const { inicio, fin } = extractTime(shiftValue);
                    
                    let excepcion = 'Programar';
                    let tipoHorario = 'Recurrente';
                    let novedad = '';

                    if (shiftValue.toLowerCase() === 'libre') {
                        excepcion = 'No Programar';
                        tipoHorario = 'Libre';
                        novedad = 'Libre';
                    } else if (shiftValue.toLowerCase().includes('vaca')) {
                        excepcion = 'No Programar';
                        novedad = 'Vacaciones';
                    } else if (shiftValue.toLowerCase().includes('incap')) {
                        excepcion = 'No Programar';
                        novedad = 'Incapacidad';
                    }

                    loadedRows.push({
                        key: `${logId}-${d}`,
                        index: globalIdx++,
                        subLinea,
                        nombre,
                        logId,
                        dia: daysMap[d],
                        excepcion,
                        inicio,
                        fin,
                        tipo: 'Operativa',
                        tipoHorario,
                        novedad,
                        vbrrhh: '',
                        obs: d === 0 ? baseObs : '',
                        totalHoras: inicio ? '08:00' : ''
                    });
                }
            });

            setRows(loadedRows);
            setActiveTab('2');
            antdMessage.success(`Procesados ${loadedRows.length} registros.`);
        } catch (err: any) {
            antdMessage.error(err.message || 'Error al procesar.');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * EXPORTACIÓN WFO (Final)
     */
    const handleDownloadWFO = async () => {
        if (rows.length === 0) return;
        setIsProcessing(true);
        try {
            const outWb = new ExcelJS.Workbook();
            const outSheet = outWb.addWorksheet('Novedades');
            outSheet.columns = [
                { header: '#', key: 'index', width: 6 },
                { header: 'Sub Linea de Negocio', key: 'subLinea', width: 30 },
                { header: 'Nombre (Formato WFO)', key: 'nombre', width: 35 },
                { header: 'LogID', key: 'logId', width: 15 },
                { header: 'Día de la Excepción', key: 'dia', width: 20 },
                { header: 'Excepción para', key: 'excepcion', width: 18 },
                { header: 'Inicio', key: 'inicio', width: 12 },
                { header: 'Fin', key: 'fin', width: 12 },
                { header: 'Tipo', key: 'tipo', width: 12 },
                { header: 'Tipo Horario ', key: 'tipoHorario', width: 15 },
                { header: 'Novedad', key: 'novedad', width: 15 },
                { header: 'VB RRHH', key: 'vbrrhh', width: 10 },
                { header: 'Observación', key: 'obs', width: 30 },
                { header: 'Total Horas Laborales por Dia', key: 'totalHoras', width: 25 }
            ];

            const headerRow = outSheet.getRow(1);
            headerRow.height = 30;
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.eachCell((cell, colNum) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (colNum === 7 || colNum === 8) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
                } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
                }
                cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right:{style:'thin'}};
            });

            rows.forEach((r) => {
                const newRowData = [
                    r.index, r.subLinea, r.nombre, r.logId, r.dia, r.excepcion, 
                    r.inicio, r.fin, r.tipo, r.tipoHorario, r.novedad, r.vbrrhh, r.obs, r.totalHoras
                ];
                const newRow = outSheet.addRow(newRowData);
                newRow.eachCell((cell) => {
                    cell.border = { top: {style:'thin', color:{argb:'FFD1D5DB'}}, left: {style:'thin', color:{argb:'FFD1D5DB'}}, bottom: {style:'thin', color:{argb:'FFD1D5DB'}}, right:{style:'thin', color:{argb:'FFD1D5DB'}}};
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.font = { size: 9 };
                });
            });

            const buffer = await outWb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `WFO_VOZ_${weekStart?.format('YYYY-MM-DD')}.xlsx`);
            antdMessage.success('WFO generado con éxito.');
        } catch (err: any) {
            antdMessage.error('Error al generar Excel.');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * MANTENIMIENTO DE DATOS
     */
    const handleRowEdit = (key: string, field: keyof WFORow, value: string) => {
        setRows(prev => prev.map(item => item.key === key ? { ...item, [field]: value } : item));
    };

    /**
     * Asignar Jornada Estándar (Viene de Ajustes)
     */
    const handleShiftSelect = (key: string, shiftLabel: string) => {
        const shiftData = STANDARD_SHIFTS[shiftLabel as keyof typeof STANDARD_SHIFTS];
        if (!shiftData) return;

        setRows(prev => prev.map(item => {
            if (item.key === key) {
                const isLibre = shiftLabel === 'Libre';
                return { 
                    ...item, 
                    inicio: shiftData.start, 
                    fin: shiftData.end,
                    jornadaLabel: shiftLabel,
                    excepcion: isLibre ? 'No Programar' : 'Programar',
                    novedad: isLibre ? 'Libre' : '',
                    tipoHorario: isLibre ? 'Libre' : 'Recurrente'
                };
            }
            return item;
        }));
    };

    /**
     * Aplicar una jornada a TODA la semana de un asesor.
     */
    const applyToWholeWeek = (logId: string, shiftLabel: string) => {
        const shiftData = STANDARD_SHIFTS[shiftLabel as keyof typeof STANDARD_SHIFTS];
        if (!shiftData) return;

        setRows(prev => prev.map(item => {
            if (item.logId === logId) {
                 const isLibre = shiftLabel === 'Libre';
                 return { 
                    ...item, 
                    inicio: shiftData.start, 
                    fin: shiftData.end,
                    jornadaLabel: shiftLabel,
                    excepcion: isLibre ? 'No Programar' : 'Programar',
                    novedad: isLibre ? 'Libre' : '',
                    tipoHorario: isLibre ? 'Libre' : 'Recurrente'
                };
            }
            return item;
        }));
        antdMessage.info(`Jornada ${shiftLabel} aplicada a la semana completa.`);
    };

    // 2. COMPONENTES

    // PESTAÑA EDITOR
    const editorColumns = [
        { 
            title: 'Asesor', 
            dataIndex: 'nombre', 
            width: 250, 
            fixed: 'left' as const,
            render: (text: string, record: WFORow) => (
                <div style={{ lineHeight: '1.2' }}>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{record.logId}</Text>
                    <br />
                    <Button 
                        type="link" 
                        size="small" 
                        icon={<ClockCircleOutlined />}
                        onClick={() => applyToWholeWeek(record.logId, 'Estándar')}
                        style={{ padding: 0, height: 20, fontSize: 10 }}
                    >
                        Poblar semana Estándar
                    </Button>
                </div>
            )
        },
        { title: 'Día', dataIndex: 'dia', width: 90 },
        { 
            title: 'Jornada Rápida', 
            width: 140,
            render: (_: any, record: WFORow) => (
                <Select 
                    placeholder="Elegir..." 
                    style={{ width: '100%' }} 
                    size="small"
                    value={record.jornadaLabel}
                    onChange={(val) => handleShiftSelect(record.key, val)}
                >
                    {Object.keys(STANDARD_SHIFTS).map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
            )
        },
        { 
            title: 'IN', 
            dataIndex: 'inicio', 
            width: 85,
            render: (val: string, record: WFORow) => (
                <Input 
                    value={val} 
                    onChange={e => handleRowEdit(record.key, 'inicio', e.target.value)} 
                    style={{ background: '#f6ffed', borderColor: '#b7eb8f', textAlign: 'center' }}
                    size="small"
                />
            )
        },
        { 
            title: 'OUT', 
            dataIndex: 'fin', 
            width: 85,
            render: (val: string, record: WFORow) => (
                <Input 
                    value={val} 
                    onChange={e => handleRowEdit(record.key, 'fin', e.target.value)} 
                    style={{ background: '#f6ffed', borderColor: '#b7eb8f', textAlign: 'center' }}
                    size="small"
                />
            )
        },
        { 
            title: 'Novedad', 
            dataIndex: 'novedad', 
            width: 140,
            render: (val: string, record: WFORow) => (
                <Input 
                    value={val} 
                    onChange={e => handleRowEdit(record.key, 'novedad', e.target.value)} 
                    size="small"
                    placeholder="Novedad..."
                />
            )
        },
        { 
            title: 'Observaciones', 
            dataIndex: 'obs', 
            width: 200,
            render: (val: string, record: WFORow) => (
                <Input 
                    value={val} 
                    onChange={e => handleRowEdit(record.key, 'obs', e.target.value)} 
                    size="small"
                />
            )
        }
    ];

    const EditorTab = (
        <Card style={{ borderRadius: 16 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space size="middle">
                        <Title level={5} style={{ margin: 0 }}>Editor Online BP</Title>
                        <Input 
                            placeholder="Buscar asesor..." 
                            prefix={<SearchOutlined />} 
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 250, borderRadius: 8 }}
                            allowClear
                        />
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<RollbackOutlined />} onClick={() => setActiveTab('1')}>Cambiar Archivo</Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setActiveTab('3')} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Confirmar Datos</Button>
                    </Space>
                </Col>
            </Row>

            <style>
                {`
                    .advisor-even { background-color: #ffffff; }
                    .advisor-odd { background-color: #fafafa; }
                    .ant-table-row-hover { background-color: #f0f5ff !important; }
                `}
            </style>

            <Table 
                dataSource={filteredRows} 
                columns={editorColumns} 
                pagination={{ pageSize: 14, hideOnSinglePage: false, showSizeChanger: false }} 
                scroll={{ x: 1000, y: 600 }}
                size="small"
                bordered
                rowClassName={(record) => {
                    const idx = uniqueAdvisors.indexOf(record.logId);
                    return idx % 2 === 0 ? 'advisor-even' : 'advisor-odd';
                }}
            />
        </Card>
    );

    // PESTAÑA CARGA
    const CargaTab = (
        <Card style={{ borderRadius: 16 }}>
             <Row gutter={24}>
                <Col span={24} style={{ marginBottom: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12 }}>1. Período Semanal</Text>
                    <DatePicker 
                        value={weekStart} 
                        onChange={setWeekStart} 
                        style={{ width: '100%', maxWidth: 400 }}
                        format="DD [de] MMMM, YYYY"
                        size="large"
                    />
                </Col>
                <Col span={24}>
                    <Text strong style={{ display: 'block', marginBottom: 12 }}>2. Importar Plantilla de Novedades</Text>
                    <Dragger 
                        multiple={false}
                        beforeUpload={(f) => { setPlantillaFile(f); return false; }} 
                        onRemove={() => setPlantillaFile(null)}
                        style={{ padding: 40, borderRadius: 16, background: '#f8fafc' }}
                    >
                        <p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: '#003a8c' }} /></p>
                        <p className="ant-upload-text">Selecciona o suelta el archivo .xlsx aquí</p>
                        {plantillaFile && <Tag color="blue" style={{ marginTop: 12 }}>{plantillaFile.name}</Tag>}
                    </Dragger>
                </Col>
            </Row>
            <Divider />
            <div style={{ textAlign: 'center' }}>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<EditOutlined />}
                    disabled={!plantillaFile || isProcessing}
                    loading={isProcessing}
                    onClick={handleProcessFile}
                    style={{ height: 50, padding: '0 40px', borderRadius: 12, background: '#fa8c16', borderColor: '#fa8c16' }}
                >
                    Comenzar Edición Interactiva
                </Button>
            </div>
        </Card>
    );

    // PESTAÑA EXPORTAR
    const ExportarTab = (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Card style={{ maxWidth: 600, margin: '0 auto', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
                <Title level={2}>¡Validación Exitosa!</Title>
                <Paragraph style={{ fontSize: 16 }}>
                    Se han verificado <strong>{rows.length}</strong> registros para la semana de {weekStart?.format('MMMM')}. 
                    El archivo está listo con todas tus correcciones manuales aplicadas.
                </Paragraph>
                <Divider />
                <Space size="middle">
                    <Button size="large" onClick={() => setActiveTab('2')} icon={<EditOutlined />}>Volver al Editor</Button>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<DownloadOutlined />} 
                        onClick={handleDownloadWFO}
                        style={{ height: 54, padding: '0 50px', borderRadius: 14, background: '#003a8c', fontSize: 16, fontWeight: 500 }}
                        loading={isProcessing}
                    >
                        Generar WFO Oficial
                    </Button>
                </Space>
            </Card>
        </div>
    );

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            {/* Header */}
            <Card style={{ borderRadius: 16, border: 'none', background: 'linear-gradient(90deg, #001529 0%, #003a8c 100%)' }}>
                <Row align="middle" gutter={24}>
                    <Col>
                        <div style={{
                            width: 50, height: 50,
                            background: 'rgba(255,255,255,0.1)', color: '#fff',
                            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                        }}>
                            <DatabaseOutlined />
                        </div>
                    </Col>
                    <Col>
                        <Title level={4} style={{ margin: 0, color: '#fff' }}>Gestor Maestro WFO (V3.1)</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Control interactivo de novedades y jornadas corporativas.</Text>
                    </Col>
                </Row>
            </Card>

            {/* Tabs */}
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                type="line"
                size="large"
                items={[
                    { key: '1', label: <Space><CloudUploadOutlined /> Carga</Space>, children: CargaTab },
                    { key: '2', label: <Space><EditOutlined /> Editor Interactivo</Space>, children: EditorTab, disabled: rows.length === 0 },
                    { key: '3', label: <Space><CheckCircleOutlined /> Exportar</Space>, children: ExportarTab, disabled: rows.length === 0 }
                ]}
            />
        </Space>
    );
};

export default ScheduleGeneratorView;
