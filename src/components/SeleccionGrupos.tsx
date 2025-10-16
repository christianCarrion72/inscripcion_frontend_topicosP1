"use client";

import { useState, useEffect } from "react";
import { useMateriasContext } from "./MateriasContext";

interface SeleccionGruposProps {
    materiasIds: number[];
    onBack: () => void;
    onInscribir: (idsGrupoMateria: number[]) => void;
}

interface Horario {
    id: number;
    horaInicio: string;
    horaFin: string;
    aula: { id: number; numero: number };
    modulo: { id: number; codigo: number };
    dias: { id: number; nombre: string }[];
}

interface CruceHorario {
    grupoId: number;
    materiaId: number;
    materiaNombre: string;
    grupoSigla: string;
    horarioConflicto: string;
}

export default function SeleccionGrupos({ materiasIds, onBack, onInscribir }: SeleccionGruposProps) {
    const { materiasDisponibles } = useMateriasContext();
    const [gruposSeleccionados, setGruposSeleccionados] = useState<Record<number, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [crucesHorario, setCrucesHorario] = useState<CruceHorario[]>([]);

    // Filtrar solo las materias seleccionadas
    const materiasSeleccionadas = Object.entries(materiasDisponibles?.materiasPorNivel || {})
        .flatMap(([_, materias]) => materias.filter(m => materiasIds.includes(m.id)));

    // Función para convertir hora string a minutos desde medianoche
    const horaAMinutos = (hora: string): number => {
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    };

    // Función para verificar si dos horarios se superponen
    const horariosSeSuperponen = (h1: Horario, h2: Horario): boolean => {
        // Verificar si comparten al menos un día
        const diasH1 = h1.dias.map(d => d.id);
        const diasH2 = h2.dias.map(d => d.id);
        const comparteDia = diasH1.some(dia => diasH2.includes(dia));
        
        if (!comparteDia) return false;

        // Convertir horas a minutos para comparación más fácil
        const inicioH1 = horaAMinutos(h1.horaInicio);
        const finH1 = horaAMinutos(h1.horaFin);
        const inicioH2 = horaAMinutos(h2.horaInicio);
        const finH2 = horaAMinutos(h2.horaFin);

        // Verificar superposición: h1 comienza antes que h2 termine Y h1 termina después que h2 comience
        return inicioH1 < finH2 && finH1 > inicioH2;
    };

    // Función para verificar cruces de horario
    const verificarCrucesHorario = (gruposActuales: Record<number, number>) => {
        const cruces: CruceHorario[] = [];
        const gruposConHorarios: Array<{
            grupoId: number;
            materiaId: number;
            materiaNombre: string;
            grupoSigla: string;
            horarios: Horario[];
        }> = [];

        // Recopilar información de todos los grupos seleccionados
        Object.entries(gruposActuales).forEach(([materiaIdStr, grupoId]) => {
            const materiaId = Number(materiaIdStr);
            const materia = materiasSeleccionadas.find(m => m.id === materiaId);
            
            if (materia) {
                const grupoMateria = materia.gruposMaterias.find(gm => gm.id === grupoId);
                
                if (grupoMateria) {
                    gruposConHorarios.push({
                        grupoId: grupoMateria.id,
                        materiaId: materia.id,
                        materiaNombre: materia.nombre,
                        grupoSigla: grupoMateria.grupo.sigla,
                        horarios: grupoMateria.horarios,
                    });
                }
            }
        });

        // Comparar todos los grupos entre sí
        for (let i = 0; i < gruposConHorarios.length; i++) {
            for (let j = i + 1; j < gruposConHorarios.length; j++) {
                const grupo1 = gruposConHorarios[i];
                const grupo2 = gruposConHorarios[j];

                // Comparar cada horario del grupo1 con cada horario del grupo2
                for (const horario1 of grupo1.horarios) {
                    for (const horario2 of grupo2.horarios) {
                        if (horariosSeSuperponen(horario1, horario2)) {
                            const diasComunes = horario1.dias
                                .filter(d1 => horario2.dias.some(d2 => d2.id === d1.id))
                                .map(d => d.nombre.slice(0, 3))
                                .join(", ");

                            cruces.push({
                                grupoId: grupo2.grupoId,
                                materiaId: grupo2.materiaId,
                                materiaNombre: grupo2.materiaNombre,
                                grupoSigla: grupo2.grupoSigla,
                                horarioConflicto: `${diasComunes} ${horario1.horaInicio.slice(0, 5)}-${horario1.horaFin.slice(0, 5)} con ${grupo1.materiaNombre} - Grupo ${grupo1.grupoSigla}`,
                            });
                        }
                    }
                }
            }
        }

        return cruces;
    };

    // Verificar cruces cada vez que cambian las selecciones
    useEffect(() => {
        const cruces = verificarCrucesHorario(gruposSeleccionados);
        setCrucesHorario(cruces);
        
        if (cruces.length > 0) {
            setError("Hay cruces de horario entre los grupos seleccionados. Por favor, revisa los horarios marcados en rojo.");
        } else if (error?.includes("cruce")) {
            setError(null);
        }
    }, [gruposSeleccionados]);

    const seleccionarGrupo = (materiaId: number, grupoId: number) => {
        setGruposSeleccionados((prev) => {
            const nuevoEstado = { ...prev };
            
            // Si el grupo ya está seleccionado, deseleccionarlo
            if (nuevoEstado[materiaId] === grupoId) {
                delete nuevoEstado[materiaId];
            } else {
                // Si no está seleccionado, seleccionarlo
                nuevoEstado[materiaId] = grupoId;
            }
            
            return nuevoEstado;
        });
        
        // Limpiar errores de selección vacía
        if (error && !error.includes("cruce")) {
            setError(null);
        }
    };

    const handleInscribir = () => {
        const idsGrupos = Object.values(gruposSeleccionados).filter(Boolean);
    
        if (idsGrupos.length === 0) {
            setError("Debes seleccionar al menos un grupo para cada materia");
            return;
        }

        if (crucesHorario.length > 0) {
            setError("No puedes inscribirte con cruces de horario. Por favor, ajusta tu selección.");
            return;
        }
    
        onInscribir(idsGrupos);
    };

    const formatHorario = (horarios: any[]) => {
        return horarios.map(h => {
            const dias = h.dias.map((d: any) => d.nombre.slice(0, 3)).join(", ");
            return `${dias} ${h.horaInicio.slice(0, 5)}-${h.horaFin.slice(0, 5)} (Aula ${h.aula.numero} - Módulo ${h.modulo.codigo})`;
        }).join(" | ");
    };

    // Función para verificar si un grupo tiene cruce de horario
    const tieneConflicto = (grupoId: number): boolean => {
        // Verificar si este grupo tiene conflicto con otros O si otros tienen conflicto con este
        const esGrupoSeleccionado = Object.values(gruposSeleccionados).includes(grupoId);
        if (!esGrupoSeleccionado) return false;

        // Buscar conflictos donde este grupo esté involucrado
        const gruposConHorarios: Array<{
            grupoId: number;
            materiaId: number;
            horarios: Horario[];
        }> = [];

        Object.entries(gruposSeleccionados).forEach(([materiaIdStr, gId]) => {
            const materiaId = Number(materiaIdStr);
            const materia = materiasSeleccionadas.find(m => m.id === materiaId);
            
            if (materia) {
                const grupoMateria = materia.gruposMaterias.find(gm => gm.id === gId);
                
                if (grupoMateria) {
                    gruposConHorarios.push({
                        grupoId: grupoMateria.id,
                        materiaId: materia.id,
                        horarios: grupoMateria.horarios,
                    });
                }
            }
        });

        // Obtener horarios del grupo actual
        const grupoActual = gruposConHorarios.find(g => g.grupoId === grupoId);
        if (!grupoActual) return false;

        // Comparar con todos los demás grupos
        for (const otroGrupo of gruposConHorarios) {
            if (otroGrupo.grupoId === grupoId) continue;

            for (const horario1 of grupoActual.horarios) {
                for (const horario2 of otroGrupo.horarios) {
                    if (horariosSeSuperponen(horario1, horario2)) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Seleccionar Grupos
            </h2>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">Estudiante:</span>{" "}
                    {materiasDisponibles?.estudiante.nombre}
                </p>
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">Registro:</span>{" "}
                    {materiasDisponibles?.estudiante.registro}
                </p>
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">Plan de Estudio:</span>{" "}
                    {materiasDisponibles?.estudiante.planEstudio}
                </p>
            </div>

            <div className="space-y-6">
                {materiasSeleccionadas.map((materia) => (
                    <div key={materia.id} className="mb-4 border rounded-lg p-4 bg-gray-50">
                        <div className="mb-3">
                            <h4 className="font-semibold text-gray-800">
                                {materia.nombre}
                            </h4>
                            <p className="text-sm text-gray-500">Código: {materia.codigo}</p>
                        </div>

                        {materia.gruposMaterias.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                                No hay grupos disponibles para esta materia
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {materia.gruposMaterias.map((grupoMateria: any) => {
                                    const conflicto = tieneConflicto(grupoMateria.id);
                                    
                                    return (
                                        <label
                                            key={grupoMateria.id}
                                            className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border ${
                                                conflicto
                                                    ? 'bg-red-50 border-red-500'
                                                    : gruposSeleccionados[materia.id] === grupoMateria.id
                                                    ? 'bg-blue-50 border-blue-500'
                                                    : 'bg-white hover:bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={gruposSeleccionados[materia.id] === grupoMateria.id}
                                                onChange={() => seleccionarGrupo(materia.id, grupoMateria.id)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-800">
                                                        Grupo {grupoMateria.grupo.sigla}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        grupoMateria.cupos > 10 
                                                            ? 'bg-green-100 text-green-800'
                                                            : grupoMateria.cupos > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {grupoMateria.cupos} cupos
                                                    </span>
                                                    {conflicto && (
                                                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 font-semibold">
                                                            ⚠️ Cruce de horario
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    👨‍🏫 {grupoMateria.docente.nombre}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    📅 {formatHorario(grupoMateria.horarios)}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && !error.includes("cruce") && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t mt-6">
                <button
                    onClick={onBack}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    ← Volver
                </button>
                <div>
                    <p className="text-sm text-gray-600 mb-2 text-right">
                        {Object.keys(gruposSeleccionados).length}/{materiasSeleccionadas.length} grupo(s) seleccionado(s)
                    </p>
                    <button
                        onClick={handleInscribir}
                        disabled={Object.keys(gruposSeleccionados).length === 0 || crucesHorario.length > 0}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Inscribir ✓
                    </button>
                </div>
            </div>
        </div>
    );
}