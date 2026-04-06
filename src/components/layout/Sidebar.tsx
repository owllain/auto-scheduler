/**
 * @file layout/Sidebar.tsx
 * @description Componente de navegación lateral mejorado para el Gestor de Horarios.
 * Soporta dispositivos móviles mediante un cajón (Drawer) y modo colapsado (Desktop).
 */

import React from 'react';
import { Layout, Menu, Typography, Space, Drawer } from 'antd';
import { 
    SettingOutlined, 
    FileTextOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useScheduleStore } from '../../store/useScheduleStore';
import type { ViewOption } from '../../types';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isMobile: boolean;
}

/**
 * Componente Sidebar.
 * Encapsula el menú de navegación y la identidad de marca (Logo).
 */
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, isMobile }) => {
    const currentView = useScheduleStore((state) => state.currentView);
    const setCurrentView = useScheduleStore((state) => state.setCurrentView);

    // Definición de los ítems del menú con títulos descriptivos
    const menuItems = [
        {
            key: 'grp_principales',
            label: collapsed ? '' : 'HERRAMIENTAS',
            type: 'group' as const,
            children: [
                {
                    key: 'templates',
                    icon: <FileTextOutlined />,
                    label: 'Generador de Plantillas',
                },
                {
                    key: 'scheduleMaker',
                    icon: <CalendarOutlined />,
                    label: 'Generador de Horarios',
                }
            ],
        },
        {
            key: 'grp_config',
            label: collapsed ? '' : 'ADMINISTRACIÓN',
            type: 'group' as const,
            children: [
                {
                    key: 'config',
                    icon: <SettingOutlined />,
                    label: 'Ajustes',
                },
            ],
        },
    ];

    const logoArea = (
        <div style={{ 
            height: 64, 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            overflow: 'hidden'
        }}>
            <div style={{ 
                minWidth: 32,
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                background: 'linear-gradient(135deg, #003a8c 0%, #fa8c16 100%)',
                marginRight: 12,
                boxShadow: '0 4px 10px rgba(0,58,140,0.15)'
            }} />
            {!collapsed && (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 13, color: '#003a8c', lineHeight: 1.1, whiteSpace: 'nowrap' }}>GESTOR DE HORARIOS</Text>
                    <Text style={{ fontSize: 10, color: '#fa8c16', fontWeight: 600, letterSpacing: 0.5 }}>NETCOM BP</Text>
                </Space>
            )}
        </div>
    );

    const menuArea = (
        <Menu
            mode="inline"
            selectedKeys={[currentView]}
            items={menuItems}
            onClick={({ key }) => {
                setCurrentView(key as ViewOption);
                if (isMobile) setCollapsed(true);
            }}
            style={{ 
                height: 'calc(100% - 64px)', 
                borderRight: 0, 
                paddingTop: 12,
                paddingBottom: 24,
                overflowY: 'auto'
            }}
        />
    );

    // Si es móvil, se muestra como Drawer
    if (isMobile) {
        return (
            <Drawer
                placement="left"
                onClose={() => setCollapsed(true)}
                open={!collapsed}
                width={260}
                bodyStyle={{ padding: 0 }}
                headerStyle={{ display: 'none' }}
                closable={false}
            >
                {logoArea}
                {menuArea}
            </Drawer>
        );
    }

    // Si es Desktop, se muestra como Sider estándar
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            collapsedWidth={80}
            theme="light"
            style={{ 
                borderRight: '1px solid #f0f0f0',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 10,
                boxShadow: '4px 0 10px rgba(0,0,0,0.02)'
            }}
        >
            {logoArea}
            {menuArea}
        </Sider>
    );
};
