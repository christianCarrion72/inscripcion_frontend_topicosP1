"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import SeleccionMaterias from "./SeleccionMaterias";
import SeleccionGrupos from "./SeleccionGrupos";
import ConfirmacionInscripcion from "./ConfirmacionInscripcion";

interface ResultadoInscripcion {
    status: "CONFIRMED" | "REJECTED";
    reason?: string;
    inscripcion?: {
        id: number;
        fechaInscripcion: Date;
    };
    grupos?: number[];
}

export default function Inscripcion() {
    const { data: session } = useSession();
    const [paso, setPaso] = useState(1);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
    const [resultado, setResultado] = useState<ResultadoInscripcion | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Procesando...");

    const handleSeleccionMaterias = (materias: number[]) => {
        setMateriasSeleccionadas(materias);
        setPaso(2);
    };

    const handleInscribir = async (idsGrupoMateria: number[]) => {
        setLoading(true);
        setLoadingMessage("Enviando solicitud de inscripción...");
        
        try {
            const callbackBaseUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/api/callbacks`
                : 'http://localhost:3000/api/callbacks';

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/inscripcions/request-seat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.token}`,
                        "x-callback-url": callbackBaseUrl,
                    },
                    body: JSON.stringify({ idsGrupoMateria }),
                }
            );
            
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al procesar inscripción");
            }

            // Si es una respuesta asíncrona
            if (data.jobId) {
                setLoadingMessage("Procesando inscripción...");
                await pollJobStatus(data.jobId);
            } else {
                // Respuesta síncrona directa
                setResultado(data as ResultadoInscripcion);
                setPaso(3);
                setLoading(false);
            }
        } catch (err) {
            setResultado({
                status: "REJECTED",
                reason: err instanceof Error ? err.message : "Error al procesar la inscripción",
            });
            setPaso(3);
            setLoading(false);
        }
    };

    const pollJobStatus = async (jobId: string) => {
        const maxAttempts = 60; // 60 segundos para inscripción
        let attempts = 0;

        const checkStatus = async () => {
            try {
                // Intentar obtener del callback local primero
                const callbackRes = await fetch(`/api/callbacks/${jobId}`);
                
                if (callbackRes.ok) {
                    const callbackData = await callbackRes.json();
                    
                    if (callbackData.status === 'completed' && callbackData.result) {
                        setResultado(callbackData.result as ResultadoInscripcion);
                        setPaso(3);
                        setLoading(false);
                        return;
                    } else if (callbackData.status === 'failed') {
                        setResultado({
                            status: "REJECTED",
                            reason: callbackData.error || 'Error procesando la inscripción',
                        });
                        setPaso(3);
                        setLoading(false);
                        return;
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
                        setResultado(statusData.result as ResultadoInscripcion);
                        setPaso(3);
                        setLoading(false);
                        return;
                    } else if (statusData.status === 'failed') {
                        setResultado({
                            status: "REJECTED",
                            reason: statusData.result || 'Error procesando la inscripción',
                        });
                        setPaso(3);
                        setLoading(false);
                        return;
                    }
                    
                    const progress = statusData.progress || 0;
                    setLoadingMessage(`Procesando inscripción... (${progress}%)`);
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 1000);
                } else {
                    throw new Error('Tiempo de espera agotado. Por favor, verifica tu inscripción más tarde.');
                }
            } catch (err) {
                setResultado({
                    status: "REJECTED",
                    reason: err instanceof Error ? err.message : "Error consultando estado",
                });
                setPaso(3);
                setLoading(false);
            }
        };

        checkStatus();
    };

    const reiniciar = () => {
        setPaso(1);
        setMateriasSeleccionadas([]);
        setResultado(null);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg font-semibold">{loadingMessage}</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Por favor espera, esto puede tomar unos momentos...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {paso === 1 && <SeleccionMaterias onNext={handleSeleccionMaterias} />}
            {paso === 2 && (
                <SeleccionGrupos
                    materiasIds={materiasSeleccionadas}
                    onBack={() => setPaso(1)}
                    onInscribir={handleInscribir}
                />
            )}
            {paso === 3 && resultado && (
                <ConfirmacionInscripcion
                    resultado={resultado}
                    onReiniciar={reiniciar}
                />
            )}
        </>
    );
}