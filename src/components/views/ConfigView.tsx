/**
 * @file views/ConfigView.tsx
 * @description Panel de administración y guía de usuario.
 * Permite configurar parámetros críticos del sistema (Jornadas, Mínimos) y ofrece ayuda operativa.
 */

import React from 'react';
import { 
    Card, 
    Typography, 
    Button, 
    Space, 
    Row, 
    Col, 
    Steps, 
    Form,
    InputNumber, 
    Input,
    Tag,
    Alert
} from 'antd';
import { 
    SettingOutlined, 
    DownloadOutlined, 
    SaveOutlined, 
    BulbOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined,
    FileTextOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ConfigView: React.FC = () => {
    /** 
     * Función para descargar la plantilla de novedades en blanco.
     * Facilita que los supervisores comiencen desde cero con el formato correcto.
     */
    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/Plantilla_Novedades.xlsx';
        link.download = 'Plantilla_AutoScheduler.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
            
            {/* 1. Header & Actions: Banner Corporativo */}
            <Card style={{ borderRadius: 16, border: 'none', background: 'linear-gradient(90deg, #001529 0%, #003a8c 100%)' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="middle">
                            <div style={{ 
                                width: 50, height: 50,
                                background: 'rgba(255,255,255,0.1)', color: '#fff', 
                                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 
                            }}>
                                <SettingOutlined />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#fff' }}>Ajustes del Sistema</Title>
                                <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Configuración y herramientas administrativas del Generador de Horarios.</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={handleDownloadTemplate}
                                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                Plantilla Base
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />} 
                                style={{ background: '#fa8c16', borderColor: '#fa8c16', boxShadow: '0 4px 10px rgba(250, 140, 22, 0.2)' }}
                            >
                                Guardar Cambios
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* 2. Guía Interactiva (Steps): Flujo recomendado de operación */}
            <Card 
                title={<Space><BulbOutlined style={{ color: '#fa8c16' }} /> <Text strong>Guía Rápida de Operación</Text></Space>}
                style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
            >
                <Steps
                    current={-1}
                    items={[
                        { title: 'Data de Personal', description: 'Carga el Excel de personal.', icon: <FileTextOutlined /> },
                        { title: 'Generar Novedades', description: 'Carga la planilla de novedades.', icon: <ThunderboltOutlined /> },
                        { title: 'Exportar WFO', description: 'Descarga el archivo final.', icon: <DownloadOutlined /> },
                    ]}
                />
            </Card>

            {/* 3. Parámetros Operativos: Jornadas y Mínimos */}
            <Row gutter={24}>
                <Col xs={24} lg={12}>
                    <Card 
                        title={<Space><ClockCircleOutlined style={{ color: '#003a8c' }} /> <Text strong>Jornadas Pre-definidas</Text></Space>}
                        style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                    >
                        <Form layout="vertical">
                            {[
                                { label: 'Apertura', start: '06:00', end: '14:00', color: 'orange' },
                                { label: 'Mañana', start: '07:00', end: '15:00', color: 'blue' },
                                { label: 'Estándar', start: '08:00', end: '17:00', color: 'cyan' },
                                { label: 'Tarde', start: '13:00', end: '21:00', color: 'purple' },
                                { label: 'Cierre', start: '14:00', end: '22:00', color: 'green' },
                            ].map((j, i) => (
                                <Row key={i} gutter={12} align="middle" style={{ marginBottom: 16 }}>
                                    <Col span={8}>
                                        <Tag color={j.color} style={{ width: '100%', textAlign: 'center' }}>{j.label}</Tag>
                                    </Col>
                                    <Col span={7}>
                                        <Input defaultValue={j.start} prefix={<Text type="secondary" style={{ fontSize: 10 }}>IN</Text>} />
                                    </Col>
                                    <Col span={2} style={{ textAlign: 'center' }}><Text type="secondary">→</Text></Col>
                                    <Col span={7}>
                                        <Input defaultValue={j.end} prefix={<Text type="secondary" style={{ fontSize: 10 }}>OUT</Text>} />
                                    </Col>
                                </Row>
                            ))}
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                        {/* Alertas de Cobertura Insuficiente */}
                        <Card 
                            title={<Space><SafetyCertificateOutlined style={{ color: '#52c41a' }} /> <Text strong>Mínimos de Cobertura</Text></Space>}
                            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                        >
                            <Alert message="Define el personal mínimo por skill para activar alertas en el visualizador." type="info" showIcon style={{ marginBottom: 20 }} />
                            {[
                                { skill: 'Visa / Especializados', min: 2 },
                                { skill: '800 Tarjetas (Voz)', min: 4 },
                                { skill: 'Redes Sociales', min: 3 },
                            ].map((s, i) => (
                                <Row key={i} justify="space-between" style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <Text>{s.skill}</Text>
                                    <Space>
                                        <Text type="secondary">Asesores min:</Text>
                                        <InputNumber defaultValue={s.min} min={0} />
                                    </Space>
                                </Row>
                            ))}
                        </Card>

                        {/* Importación de Referencias Masivas */}
                        <Card 
                            title={<Space><FileTextOutlined style={{ color: '#fa8c16' }} /> <Text strong>Importación de Referencias</Text></Space>}
                            style={{ borderRadius: 16 }}
                        >
                            <TextArea 
                                placeholder="Pega aquí los IDs de los agentes..." 
                                rows={3} 
                                defaultValue={`113021, 113068, 113008, 113027, 113015\n# Personal Crítico`}
                            />
                        </Card>
                    </Space>
                </Col>
            </Row>
            <div style={{ height: 40 }} />
        </Space>
    );
};
