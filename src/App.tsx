import { useScheduleStore } from './store/useScheduleStore';
import { Sidebar } from './components/layout/Sidebar';
import { InputSection } from './components/schedule/InputSection';
import { ScheduleGrid } from './components/schedule/ScheduleGrid';
import { StaffView } from './components/views/StaffView';
import { ConfigView } from './components/views/ConfigView';
import { CoverageView } from './components/views/CoverageView';
import { FileDown, Calendar } from 'lucide-react';
import { downloadScheduleExcel } from './utils/excelGenerator';
import { MacButton } from './components/ui/MacButton';
import { MacBadge } from './components/ui/MacBadge';

function App() {
  const { currentView, shifts, agents, weekStart } = useScheduleStore();

  // Función wrapper para pasar el estado completo al generador
  const handleExport = () => {
    // Reconstruimos el objeto de estado para pasarlo a la función
    downloadScheduleExcel({ agents, shifts, weekStart } as any);
  };

  return (
    // Fondo animado y layout
    <div className="min-h-screen font-sans flex bg-[#f5f5f7] relative overflow-hidden text-slate-800">

      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
      <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-200/30 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none animate-pulse duration-[7s]" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative z-10 h-screen overflow-y-auto scrollbar-hide">
        <div className="max-w-[1600px] mx-auto pb-20">

          {/* Header */}
          <header className="mb-8 flex justify-between items-end sticky top-0 bg-[#f5f5f7]/80 backdrop-blur-md z-30 py-4 -mx-8 px-8 border-b border-white/0 transition-all">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                {currentView === 'dashboard' ? 'General' :
                  currentView === 'staff' ? 'Personal' :
                    currentView === 'coverage' ? 'Coberturas' : 'Configuración'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <MacBadge variant="neutral">{agents.length} Asesores</MacBadge>
                <MacBadge variant="info">v2.0 Beta</MacBadge>
              </div>
            </div>

            {currentView === 'dashboard' && shifts.length > 0 && (
              <MacButton
                onClick={handleExport}
                variant="primary"
                className="shadow-lg shadow-blue-500/30"
              >
                <div className="flex items-center gap-2">
                  <FileDown className="w-4 h-4" />
                  Exportar Excel
                </div>
              </MacButton>
            )}
          </header>

          {/* Renderizado de Vistas */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {currentView === 'dashboard' && (
              <>
                <InputSection />
                {shifts.length > 0 ? (
                  <div className="mt-8">
                    <ScheduleGrid />
                  </div>
                ) : (
                  <div className="mt-12 text-center text-slate-400 border-2 border-dashed border-slate-200/60 rounded-3xl p-10 bg-white/40">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium">No hay horarios cargados</p>
                    <p className="text-sm mt-1 opacity-70">Usa el panel superior para importar tus datos.</p>
                  </div>
                )}
              </>
            )}

            {currentView === 'staff' && <StaffView />}

            {currentView === 'coverage' && <CoverageView />}

            {currentView === 'config' && <ConfigView />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;