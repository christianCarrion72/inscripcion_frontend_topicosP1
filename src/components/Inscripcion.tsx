"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import SeleccionMaterias from "./SeleccionMaterias";
import SeleccionGrupos from "./SeleccionGrupos";
import ConfirmacionInscripcion from "./ConfirmacionInscripcion";
import TareaPendiente from "./TareaPendiente";

interface ResultadoInscripcion {
    status: "CONFIRMED" | "REJECTED";
    reason?: string;
    inscripcion?: {
        id: number;
        fechaInscripcion: Date;
    };
    grupos?: number[];
}

interface TareaInscripcion {
    jobId: string;
    mensaje: string;
    notificationEndpoint: string;
}

export default function Inscripcion() {
    const { data: session } = useSession();
    const [paso, setPaso] = useState(1);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
    const [resultado, setResultado] = useState<ResultadoInscripcion | null>(null);
    const [tarea, setTarea] = useState<TareaInscripcion | null>(null);

    const handleSeleccionMaterias = (materias: number[]) => {
        setMateriasSeleccionadas(materias);
        setPaso(2);
    };

    const handleInscribir = async (idsGrupoMateria: number[]) => {
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

            // Guardar la tarea pendiente
            setTarea({
                jobId: data.jobId,
                mensaje: data.mensaje || "Procesando Tarea",
                notificationEndpoint: data.notificationEndpoint
            });
            setPaso(3);
            
        } catch (err) {
            setResultado({
                status: "REJECTED",
                reason: err instanceof Error ? err.message : "Error al procesar la inscripción",
            });
            setPaso(3);
        }
    };

    const consultarEstado = async (jobId: string) => {
        try {
            // Intentar obtener del callback local primero
            const callbackRes = await fetch(`/api/callbacks/${jobId}`);
            
            if (callbackRes.ok) {
                const callbackData = await callbackRes.json();
                
                if (callbackData.status === 'completed' && callbackData.result) {
                    setResultado(callbackData.result as ResultadoInscripcion);
                    setTarea(null);
                    return;
                } else if (callbackData.status === 'failed') {
                    setResultado({
                        status: "REJECTED",
                        reason: callbackData.error || 'Error procesando la inscripción',
                    });
                    setTarea(null);
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
                    setTarea(null);
                } else if (statusData.status === 'failed') {
                    setResultado({
                        status: "REJECTED",
                        reason: statusData.result || 'Error procesando la inscripción',
                    });
                    setTarea(null);
                } else {
                    // Aún está procesando
                    alert(`Estado: ${statusData.status}. La tarea aún está en proceso.`);
                }
            } else {
                throw new Error('No se pudo consultar el estado');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error consultando estado");
        }
    };

    const reiniciar = () => {
        setPaso(1);
        setMateriasSeleccionadas([]);
        setResultado(null);
        setTarea(null);
    };

    return (
        <div className="space-y-6">
            {paso === 1 && <SeleccionMaterias onNext={handleSeleccionMaterias} />}
            
            {paso === 2 && (
                <SeleccionGrupos
                    materiasIds={materiasSeleccionadas}
                    onBack={() => setPaso(1)}
                    onInscribir={handleInscribir}
                />
            )}
            
            {paso === 3 && (
                <>
                    {tarea && (
                        <TareaPendiente 
                            tarea={tarea} 
                            onConsultar={consultarEstado} 
                        />
                    )}
                    
                    {resultado && (
                        <ConfirmacionInscripcion
                            resultado={resultado}
                            onReiniciar={reiniciar}
                        />
                    )}
                </>
            )}
        </div>
    );
}