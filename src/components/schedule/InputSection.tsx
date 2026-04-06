import React, { useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { parseSupervisorFile } from '../../utils/excelLoader';
import { Upload, Calendar, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { format, startOfWeek, parse } from 'date-fns';
import { es } from 'date-fns/locale';

export const InputSection: React.FC = () => {
    const { agents, addShift, clearShifts, setWeekStart } = useScheduleStore();

    const [selectedDate, setSelectedDate] = useState<string>(
        format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    );
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMsg(null);
        clearShifts();

        try {
            const weekStart = parse(selectedDate, 'yyyy-MM-dd', new Date());
            setWeekStart(weekStart);

            const newShifts = await parseSupervisorFile(file, weekStart, agents);

            if (newShifts.length === 0) {
                setMsg({ type: 'error', text: 'No se encontraron turnos válidos.' });
            } else {
                newShifts.forEach(shift => addShift(shift));
                setMsg({ type: 'success', text: `¡Éxito! Cargados ${newShifts.length} turnos.` });
            }
        } catch (error) {
            console.error(error);
            setMsg({ type: 'error', text: "Error leyendo el archivo." });
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Configuración de Carga
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Lunes de inicio
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                        />
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                        Semana seleccionada: {format(parse(selectedDate, 'yyyy-MM-dd', new Date()), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Archivo Excel
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {loading ? (
                            <span className="text-blue-600 font-medium animate-pulse">Procesando...</span>
                        ) : msg ? (
                            <span className={`font-medium flex items-center justify-center gap-2 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {msg.text}
                            </span>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500">
                                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                <span className="text-sm">Subir Excel</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};