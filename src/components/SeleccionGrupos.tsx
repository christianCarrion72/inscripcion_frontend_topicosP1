"use client";

import { useState } from "react";
import { useMateriasContext } from "./MateriasContext";

interface SeleccionGruposProps {
    materiasIds: number[];
    onBack: () => void;
    onInscribir: (idsGrupoMateria: number[]) => void;
}

export default function SeleccionGrupos({ materiasIds, onBack, onInscribir }: SeleccionGruposProps) {
    const { materiasDisponibles } = useMateriasContext();
    const [gruposSeleccionados, setGruposSeleccionados] = useState<Record<number, number>>({});
    const [error, setError] = useState<string | null>(null);

    // Filtrar solo las materias seleccionadas
    const materiasSeleccionadas = Object.entries(materiasDisponibles?.materiasPorNivel || {})
        .flatMap(([_, materias]) => materias.filter(m => materiasIds.includes(m.id)));

    const seleccionarGrupo = (materiaId: number, grupoId: number) => {
        setGruposSeleccionados((prev) => ({
            ...prev,
            [materiaId]: grupoId,
        }));
        setError(null);
    };

    const handleInscribir = () => {
        const idsGrupos = Object.values(gruposSeleccionados).filter(Boolean);
    
        if (idsGrupos.length === 0) {
            setError("Debes seleccionar al menos un grupo para cada materia");
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
                                {materia.gruposMaterias.map((grupoMateria: any) => (
                                    <label
                                        key={grupoMateria.id}
                                        className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border ${
                                            gruposSeleccionados[materia.id] === grupoMateria.id
                                                ? 'bg-blue-50 border-blue-500'
                                                : 'bg-white hover:bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`materia-${materia.id}`}
                                            checked={gruposSeleccionados[materia.id] === grupoMateria.id}
                                            onChange={() => seleccionarGrupo(materia.id, grupoMateria.id)}
                                            className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1"
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
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                👨‍🏫 {grupoMateria.docente.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                📅 {formatHorario(grupoMateria.horarios)}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
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
                        disabled={Object.keys(gruposSeleccionados).length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Inscribir ✓
                    </button>
                </div>
            </div>
        </div>
    );
}