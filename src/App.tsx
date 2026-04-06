/**
 * @file App.tsx
 * @description Componente raíz de la aplicación con layout responsive.
 */

import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, theme, Button } from 'antd';
import { 
  MenuOutlined, 
  MenuUnfoldOutlined, 
  MenuFoldOutlined 
} from '@ant-design/icons';
import { Sidebar } from './components/layout/Sidebar';
import { ConfigView } from './components/views/ConfigView';
import { TemplateGeneratorView } from './components/views/TemplateGeneratorView';
import { ScheduleGeneratorView } from './components/views/ScheduleGeneratorView';
import { useScheduleStore } from './store/useScheduleStore';

const { Content, Header } = Layout;

/**
 * Hook personalizado para determinar la vista activa en el marco principal.
 */
const ViewRenderer: React.FC = () => {
  const currentView = useScheduleStore((state) => state.currentView);

  switch (currentView) {
    case 'config':
      return <ConfigView />;
    case 'templates':
      return <TemplateGeneratorView />;
    case 'scheduleMaker':
      return <ScheduleGeneratorView />;
    default:
      return <TemplateGeneratorView />;
  }
};

/**
 * Componente principal App.
 */
const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Efecto para detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true); // Ocultar por defecto en móviles
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configuración del tema corporativo
  const themeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#003a8c',
      borderRadius: 12,
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      colorLink: '#fa8c16',
    },
    components: {
      Layout: {
        headerBg: '#ffffff',
        bodyBg: '#f8fafc',
      },
    }
  };

  const sidebarWidth = 260;
  const collapsedWidth = 80;

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          isMobile={isMobile} 
        />
        
        <Layout 
          style={{ 
            transition: 'all 0.2s',
            marginLeft: isMobile ? 0 : (collapsed ? collapsedWidth : sidebarWidth) 
          }}
        >
          <Header style={{ 
            padding: '0 24px', 
            background: '#fff', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            position: 'sticky',
            top: 0,
            zIndex: 9,
            height: 64
          }}>
            <Button
              type="text"
              icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '18px',
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc'
              }}
            />
            {/* Sección derecha del header eliminada por solicitud del usuario */}
          </Header>

          <Content style={{ 
            padding: isMobile ? '16px' : '28px 40px', 
            minHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            background: '#f8fafc'
          }}>
            <ViewRenderer />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;