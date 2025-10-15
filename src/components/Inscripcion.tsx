"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Swal from "sweetalert2";
import SeleccionMaterias from "./SeleccionMaterias";
import SeleccionGrupos from "./SeleccionGrupos";
import ConfirmacionInscripcion from "./ConfirmacionInscripcion";
import TareaPendiente from "./TareaPendiente";
import { useMateriasContext } from "./MateriasContext";

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
    const { limpiarDatos } = useMateriasContext();
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
                `${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/inscripcions/request-seat`,
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

            const statusRes = await fetch(
                `${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/tareas/status/${jobId}`,
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
                    // Usar SweetAlert2 en lugar de alert
                    await Swal.fire({
                        icon: 'info',
                        title: 'Procesando...',
                        html: `<p>Estado: <strong>${statusData.status}</strong></p><p>La tarea aún está en proceso.</p>`,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#3b82f6',
                    });
                }
            } else {
                throw new Error('No se pudo consultar el estado');
            }
        } catch (err) {
            // Usar SweetAlert2 para errores
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err instanceof Error ? err.message : "Error consultando estado",
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ef4444',
            });
        }
    };

    const reiniciar = () => {
        setPaso(1);
        setMateriasSeleccionadas([]);
        setResultado(null);
        setTarea(null);
        limpiarDatos();
    };

    const volverPaso1 = () => {
        setPaso(1);
        setMateriasSeleccionadas([]);
    };

    return (
        <div className="space-y-6">
            {paso === 1 && <SeleccionMaterias onNext={handleSeleccionMaterias} />}
            
            {paso === 2 && (
                <SeleccionGrupos
                    materiasIds={materiasSeleccionadas}
                    onBack={volverPaso1}
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