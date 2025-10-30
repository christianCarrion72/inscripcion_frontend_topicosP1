"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { getCallbackBaseUrl } from "@/lib/getCallbackBaseUrl";
import { useMateriasContext } from "./MateriasContext";

interface SeleccionMateriasProps {
    onNext: (materiasIds: number[]) => void;
}

export default function SeleccionMaterias({ onNext }: SeleccionMateriasProps) {
    const { data: session } = useSession();
    const { materiasDisponibles, setMateriasDisponibles } = useMateriasContext();
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Cargando...");
    const [error, setError] = useState<string | null>(null);

    const cargarMaterias = async () => {
        setLoading(true);
        setLoadingMessage("Solicitando materias disponibles...");
        setError(null);
        
        try {
            const callbackBaseUrl = getCallbackBaseUrl();

            const res = await fetch(
                `/api/gateway/estudiantes/materias-disponibles`,
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
                throw new Error(data.message || "Error al cargar materias");
            }

            if (data.jobId) {
                setLoadingMessage("Procesando solicitud...");
                await pollJobStatus(data.jobId);
            } else {
                setMateriasDisponibles(data);
                setLoading(false);
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
                const callbackRes = await fetch(`/api/callbacks/${jobId}`);
                
                if (callbackRes.ok) {
                    const callbackData = await callbackRes.json();
                    
                    if (callbackData.status === 'completed' && callbackData.result) {
                        setMateriasDisponibles(callbackData.result);
                        setLoading(false);
                        return;
                    } else if (callbackData.status === 'failed') {
                        throw new Error(callbackData.error || 'Error procesando la solicitud');
                    }
                }

                const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3005/proxy';
                const statusRes = await fetch(
                    `${gatewayUrl}/api/tareas/status/${jobId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.token}`,
                        },
                    }
                );

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    
                    if (statusData.status === 'completed') {
                        setMateriasDisponibles(statusData.result);
                        setLoading(false);
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

    const toggleMateria = (materiaId: number) => {
        setMateriasSeleccionadas((prev) =>
            prev.includes(materiaId)
                ? prev.filter((id) => id !== materiaId)
                : [...prev, materiaId]
        );
    };

    const handleContinuar = () => {
        if (materiasSeleccionadas.length === 0) {
            setError("Debes seleccionar al menos una materia");
            return;
        }
        onNext(materiasSeleccionadas);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Seleccionar Materias para Inscripción
            </h2>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">{loadingMessage}</p>
                </div>
            ) : !materiasDisponibles ? (
                <div className="text-center py-8">
                    <button
                        onClick={cargarMaterias}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Cargar Materias Disponibles
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Estudiante:</span>{" "}
                            {materiasDisponibles.estudiante?.nombre}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Materias Aprobadas:</span>{" "}
                            {materiasDisponibles.materiasAprobadas}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Materias Disponibles:</span>{" "}
                            {materiasDisponibles.materiasDisponibles}
                        </p>
                    </div>

                    {Object.entries(materiasDisponibles.materiasPorNivel || {}).map(
                        ([nivel, materias]) => (
                            <div key={nivel} className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                                    {nivel}
                                </h3>
                                <div className="space-y-2">
                                    {materias.map((materia) => (
                                        <label
                                            key={materia.id}
                                            className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={materiasSeleccionadas.includes(materia.id)}
                                                onChange={() => toggleMateria(materia.id)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-800">
                                                    {materia.nombre}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Código: {materia.codigo}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            {materiasSeleccionadas.length} materia(s) seleccionada(s)
                        </p>
                        <button
                            onClick={handleContinuar}
                            disabled={materiasSeleccionadas.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Continuar →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}