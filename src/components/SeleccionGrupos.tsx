"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface GrupoMateria {
    id: number;
    cupos: number;
    idMateria: {
        id: number;
        nombre: string;
        codigo: string;
    };
    idDocente: {
        id: number;
        nombre: string;
    };
    idGrupo: {
        id: number;
        nombre: string;
    };
}

interface GruposPorMateria {
    materia: {
        id: number;
        nombre: string;
        codigo: string;
    };
    grupos: GrupoMateria[];
}

interface SeleccionGruposProps {
    materiasIds: number[];
    onBack: () => void;
    onInscribir: (idsGrupoMateria: number[]) => void;
}

export default function SeleccionGrupos({ materiasIds, onBack, onInscribir }: SeleccionGruposProps) {
    const { data: session } = useSession();
    const [gruposPorMateria, setGruposPorMateria] = useState<Record<number, GruposPorMateria>>({});
    const [gruposSeleccionados, setGruposSeleccionados] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Cargando grupos...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarGrupos();
    }, []);

    const cargarGrupos = async () => {
        setLoading(true);
        setLoadingMessage("Solicitando grupos disponibles...");
        setError(null);
        
        try {
            const callbackBaseUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/api/callbacks`
                : 'http://localhost:3000/api/callbacks';

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/grupo-materias`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.token}`,
                        "x-callback-url": callbackBaseUrl,
                    },
                }
            );
            
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al cargar grupos");
            }

            // Si es una respuesta asíncrona
            if (data.jobId) {
                setLoadingMessage("Procesando solicitud...");
                await pollJobStatus(data.jobId);
            } else {
                // Respuesta síncrona directa
                procesarGrupos(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
            setLoading(false);
        }
    };

    const pollJobStatus = async (jobId: string) => {
        const maxAttempts = 30;
        let attempts = 0;

        const checkStatus = async () => {
            try {
                // Intentar obtener del callback local
                const callbackRes = await fetch(`/api/callbacks/${jobId}`);
                
                if (callbackRes.ok) {
                    const callbackData = await callbackRes.json();
                    
                    if (callbackData.status === 'completed' && callbackData.result) {
                        procesarGrupos(callbackData.result);
                        return;
                    } else if (callbackData.status === 'failed') {
                        throw new Error(callbackData.error || 'Error procesando la solicitud');
                    }
                }

                // Si no está en callback, consultar el backend
                const statusRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/tareas/status/${jobId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.token}`,
                        },
                    }
                );

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    
                    if (statusData.status === 'completed') {
                        procesarGrupos(statusData.result);
                        return;
                    } else if (statusData.status === 'failed') {
                        throw new Error(statusData.result || 'Error procesando la solicitud');
                    }
                    
                    setLoadingMessage(`Procesando... (${statusData.progress || 0}%)`);
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 1000);
                } else {
                    throw new Error('Tiempo de espera agotado');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error consultando estado");
                setLoading(false);
            }
        };

        checkStatus();
    };

    const procesarGrupos = (data: GrupoMateria[]) => {
        const agrupados: Record<number, GruposPorMateria> = {};
    
        // Crear entradas para todas las materias seleccionadas
        materiasIds.forEach((id) => {
            const materia = data.find((g) => g.idMateria.id === id)?.idMateria || { id, nombre: "Materia sin grupo", codigo: "" };
            agrupados[id] = {
                materia,
                grupos: [],
            };
        });
    
        // Agregar los grupos existentes
        data.forEach((grupo: GrupoMateria) => {
            const materiaId = grupo.idMateria?.id;
            if (materiasIds.includes(materiaId)) {
                agrupados[materiaId].grupos.push(grupo);
            }
        });
    
        setGruposPorMateria(agrupados);
        setLoading(false);
    };

    const seleccionarGrupo = (materiaId: number, grupoId: number) => {
        setGruposSeleccionados((prev) => ({
            ...prev,
            [materiaId]: grupoId,
        }));
    };

    const handleInscribir = () => {
        // Obtener solo los grupos seleccionados
        const idsGrupoMateria = Object.values(gruposSeleccionados).filter(Boolean);
    
        // Validación: al menos un grupo debe estar seleccionado
        if (idsGrupoMateria.length === 0) {
            setError("Debes seleccionar al menos un grupo de alguna materia");
            return;
        }
    
        // Llamar al callback solo con los grupos seleccionados
        onInscribir(idsGrupoMateria);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Seleccionar Grupos
            </h2>
    
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">{loadingMessage}</p>
                </div>
            ) : (
                <>
                    {Object.entries(gruposPorMateria).map(([materiaId, data]) => (
                        <div key={materiaId} className="mb-6 border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                {data.materia?.nombre || "Materia sin grupo"}
                            </h3>
    
                            {data.grupos.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                    No hay grupos disponibles
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {data.grupos.map((grupo) => (
                                        <label
                                            key={grupo.id}
                                            className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name={`materia-${materiaId}`}
                                                checked={gruposSeleccionados[Number(materiaId)] === grupo.id}
                                                onChange={() => seleccionarGrupo(Number(materiaId), grupo.id)}
                                                className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="ml-3 flex-1">
                                                <p className="font-medium text-gray-800">
                                                    Grupo {grupo.idGrupo?.nombre || grupo.id}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Docente: {grupo.idDocente?.nombre || "Sin asignar"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Cupos disponibles: {grupo.cupos}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
    
                    <div className="flex justify-between items-center pt-4 border-t">
                        <button
                            onClick={onBack}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            ← Volver
                        </button>
                        <button
                            onClick={handleInscribir}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Inscribir
                        </button>
                    </div>
                </>
            )}
        </div>
    );    
}