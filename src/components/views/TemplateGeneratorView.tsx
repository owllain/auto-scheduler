/**
 * @file views/TemplateGeneratorView.tsx
 * @description Módulo 1 — Cogeneración de Plantillas de Novedades.
 * 
 * Flujo:
 * 1. El usuario sube un Excel de "Lista de Personal" (estructura Netcom BP).
 * 2. El sistema detecta la hoja correcta y extrae Supervisor, Login y Asesor.
 * 3. Se muestra una vista previa en tabla.
 * 4. Al hacer clic en "Descargar", se rellena la plantilla base (public/Plantilla_Novedades.xlsx)
 *    con los datos extraídos y se descarga como Excel.
 */

import React, { useState } from 'react';
import {
    Upload,
    Card,
    Typography,
    Button,
    Space,
    Alert,
    Table,
    Tag,
    Row,
    Col,
    Statistic,
    Empty,
} from 'antd';
import {
    DownloadOutlined,
    TeamOutlined,
    FileExcelOutlined,
    CheckCircleOutlined,
    LayoutOutlined,
} from '@ant-design/icons';
import readXlsxFile from 'read-excel-file';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { Dragger } = Upload;
const { Title, Text } = Typography;

/** Estructura de cada registro extraído del Excel de personal */
interface PersonalRecord {
    key: string;
    supervisor: string;
    login: string;
    asesor: string;
}

export const TemplateGeneratorView: React.FC = () => {
    const [records, setRecords] = useState<PersonalRecord[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    /**
     * Lee el Excel subido, detecta la hoja de "Lista de personal" y extrae los datos.
     * 
     * Lógica de detección:
     * - Busca la hoja "Lista de personal ." (exacta).
     * - Si no, busca cualquier hoja con "lista" (insensible a mayúsculas).
     * - Fallback: primera hoja.
     */
    const handleUpload = async (file: File) => {
        setIsProcessing(true);
        setUploadError(null);
        setRecords([]);
        setFileName(file.name);

        try {
            // 1. Obtener nombres de hojas
            const sheetNames = await readXlsxFile(file, { getSheets: true }) as unknown as any[];
            
            // 2. Detectar la hoja correcta
            let targetSheet = sheetNames.find((s: any) => s.name === 'Lista de personal .');
            
            if (!targetSheet) {
                targetSheet = sheetNames.find((s: any) => 
                    s.name.toLowerCase().includes('lista')
                );
            }
            
            if (!targetSheet) {
                targetSheet = sheetNames[0];
            }

            // 3. Leer los datos de la hoja seleccionada
            const rows = await readXlsxFile(file, { sheet: targetSheet.name });

            if (rows.length < 2) {
                throw new Error('El archivo está vacío o no tiene datos suficientes.');
            }

            // 4. Buscar cabeceras en las primeras 10 filas
            const normalize = (val: unknown): string => {
                if (!val) return '';
                return val.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            };

            let headerIdx = -1;
            const colIdx = { supervisor: -1, login: -1, asesor: -1 };

            const scanLimit = Math.min(rows.length, 10);
            for (let r = 0; r < scanLimit; r++) {
                const row = rows[r];
                for (let c = 0; c < row.length; c++) {
                    const cellValue = normalize(row[c]);
                    if (cellValue === 'supervisor') colIdx.supervisor = c;
                    else if (cellValue === 'login' || cellValue === 'log id' || cellValue === 'logid') colIdx.login = c;
                    else if (cellValue === 'asesor' || cellValue === 'nombre' || cellValue.includes('nombre completo')) colIdx.asesor = c;
                }
                
                // Si encontramos al menos Supervisor y Asesor, consideramos que esta es la cabecera
                if (colIdx.supervisor !== -1 && colIdx.asesor !== -1) {
                    headerIdx = r;
                    break;
                }
            }

            if (headerIdx === -1) {
                throw new Error(
                    'No se pudieron identificar las columnas "Supervisor" y "Asesor". ' +
                    'Asegúrate de que el archivo tenga los encabezados correctos.'
                );
            }

            // 5. Extraer registros válidos después de la cabecera
            const extracted: PersonalRecord[] = [];
            for (let i = headerIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const supervisor = colIdx.supervisor !== -1 ? (row[colIdx.supervisor]?.toString().trim() || '') : '';
                const login = colIdx.login !== -1 ? (row[colIdx.login]?.toString().trim() || '') : '';
                const asesor = colIdx.asesor !== -1 ? (row[colIdx.asesor]?.toString().trim() || '') : '';

                // El nombre del asesor es obligatorio para incluir el registro
                // También ignoramos capacitadores o registros con error en el supervisor (e.j. #ERROR_#N/A)
                if (!asesor || supervisor.includes('#ERROR')) continue;

                extracted.push({
                    key: `${i}-${login}`,
                    supervisor,
                    login,
                    asesor
                });
            }

            if (extracted.length === 0) {
                throw new Error('No se detectaron datos de personal válidos.');
            }

            setRecords(extracted);
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Error al procesar el archivo Excel.');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Rellena la plantilla base con los registros extraídos.
     */
    const handleDownload = async () => {
        if (records.length === 0) return;
        setIsGenerating(true);

        try {
            // 1. Obtener la plantilla desde public
            const response = await fetch('/Plantilla_Novedades.xlsx');
            if (!response.ok) throw new Error('No se pudo encontrar la plantilla base.');
            const buffer = await response.arrayBuffer();

            // 2. Cargar con ExcelJS
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const sheet = workbook.getWorksheet('Novedades Semanal');
            if (!sheet) throw new Error('La plantilla no contiene la hoja "Novedades Semanal".');

            // 3. Limpiar registros anteriores (desde la fila 2 hacia abajo)
            const lastRowIndex = sheet.rowCount;
            if (lastRowIndex >= 2) {
                for (let i = lastRowIndex; i >= 2; i--) {
                    sheet.spliceRows(i, 1);
                }
            }

            // 4. Insertar los nuevos registros
            records.forEach(record => {
                sheet.addRow([
                    record.supervisor,   // A: SUPERVISOR
                    record.login,        // B: LOG ID
                    record.asesor,       // C: NOMBRE COMPLETO
                    'Libre',             // D: LUNES
                    'Libre',             // E: MARTES
                    'Libre',             // F: MIÉRCOLES
                    'Libre',             // G: JUEVES
                    'Libre',             // H: VIERNES
                    'Libre',             // I: SÁBADO
                    'Libre',             // J: DOMINGO
                    ''                   // K: OBSERVACIONES
                ]);
            });

            // 5. Aplicar formato básico si es necesario (opcional, la plantilla ya debería traerlo)

            // 6. Descargar el nuevo archivo
            const outBuffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([outBuffer]), 'PLANTILLA_NOVEDADES.xlsx');
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Error al generar el archivo de salida.');
        } finally {
            setIsGenerating(false);
        }
    };

    /** Propiedades del componente Upload de Ant Design */
    const uploadProps = {
        name: 'file',
        multiple: false,
        accept: '.xlsx,.xls',
        showUploadList: false,
        beforeUpload: (file: File) => {
            handleUpload(file);
            return false;
        }
    };

    /** Configuración de columnas para la tabla de vista previa */
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: unknown, __: unknown, index: number) => index + 1
        },
        {
            title: 'Supervisor',
            dataIndex: 'supervisor',
            key: 'supervisor',
            width: '30%',
            render: (text: string) => <Text style={{ fontSize: 13 }}>{text || <Tag color="warning">—</Tag>}</Text>
        },
        {
            title: 'Login',
            dataIndex: 'login',
            key: 'login',
            width: 100,
            render: (text: string) => <Tag color="blue" style={{ borderRadius: 4 }}>{text}</Tag>
        },
        {
            title: 'Asesor',
            dataIndex: 'asesor',
            key: 'asesor',
            render: (text: string) => <Text strong>{text}</Text>
        }
    ];

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            {/* ENCABEZADO - BANNER CORPORATIVO */}
            <Card style={{ borderRadius: 16, border: 'none', background: 'linear-gradient(90deg, #001529 0%, #003a8c 100%)' }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space align="center" size="middle">
                            <div style={{
                                width: 50, height: 50,
                                background: 'rgba(255,255,255,0.1)', color: '#fff',
                                borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24
                            }}>
                                <LayoutOutlined />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#fff' }}>Generador de Plantillas</Title>
                                <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Crea la base semanal a partir de la lista de personal de Netcom.</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        {records.length > 0 && (
                            <Tag color="blue" icon={<TeamOutlined />} style={{ padding: '4px 12px', fontSize: 13, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                                {records.length} asesores detectados
                            </Tag>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* SECCIÓN DE CARGA */}
            <Card style={{ borderRadius: 16 }}>
                <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 0' }}>
                    <Dragger {...uploadProps} disabled={isProcessing} style={{ borderRadius: 16, background: '#fafafa' }}>
                        <p className="ant-upload-drag-icon">
                            <FileExcelOutlined style={{ color: '#fa8c16' }} />
                        </p>
                        <p className="ant-upload-text">
                            {isProcessing ? 'Procesando...' : 'Selecciona o arrastra el archivo de personal'}
                        </p>
                        <p className="ant-upload-hint">Soporta formatos .xlsx y .xls</p>
                    </Dragger>

                    {fileName && (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '2px 8px' }}>
                                Archivo cargado: {fileName}
                            </Tag>
                        </div>
                    )}

                    {uploadError && (
                        <Alert 
                            message="Ups! Ocurrió un problema" 
                            description={uploadError} 
                            type="error" 
                            showIcon 
                            style={{ marginTop: 20, borderRadius: 12 }} 
                        />
                    )}
                </div>
            </Card>

            {/* VISTA PREVIA Y ACCIÓN */}
            {records.length > 0 && (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic title="Asesores Extraídos" value={records.length} prefix={<TeamOutlined />} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic 
                                    title="Supervisores Diferentes" 
                                    value={new Set(records.map(r => r.supervisor)).size} 
                                    prefix={<TeamOutlined />} 
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<DownloadOutlined />} 
                                block 
                                loading={isGenerating}
                                onClick={handleDownload}
                                style={{
                                    height: '100%',
                                    borderRadius: 12,
                                    background: '#52c41a',
                                    border: 'none',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    boxShadow: '0 4px 14px rgba(82, 196, 26, 0.3)'
                                }}
                            >
                                Descargar Plantilla
                            </Button>
                        </Col>
                    </Row>

                    <Card 
                        title="Resumen de datos para la plantilla" 
                        style={{ borderRadius: 16 }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={records} 
                            pagination={{ pageSize: 15, position: ['bottomCenter'] }} 
                            size="small"
                        />
                    </Card>
                </>
            )}

            {/* ESTADO VACÍO */}
            {records.length === 0 && !uploadError && !isProcessing && (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Sube la lista de personal para ver la vista previa" 
                    style={{ margin: '40px 0' }}
                />
            )}
        </Space>
    );
};
