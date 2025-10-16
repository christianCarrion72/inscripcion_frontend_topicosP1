"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

interface Materia {
    id: number;
    nota: number | null;
    materia: {
        id: number;
        nombre: string;
        codigo: string;
    };
    grupo: {
        id: number;
        sigla: string;
    };
    docente: {
        id: number;
        nombre: string;
    };
}

interface Inscripcion {
    id: number;
    fechaInscripcion: string;
    periodo: string;
    materias: Materia[];
}

interface HistorialData {
    estudiante: {
        id: number;
        nombre: string;
        ci: number;
        registro: number;
    };
    inscripciones: Inscripcion[];
}

export default function HistorialInscripciones() {
    const { data: session } = useSession();
    const [historial, setHistorial] = useState<HistorialData | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Cargando...");
    const [error, setError] = useState<string | null>(null);
    const [inscripcionExpandida, setInscripcionExpandida] = useState<number | null>(null);

    const cargarHistorial = async () => {
        setLoading(true);
        setLoadingMessage("Solicitando historial de inscripciones...");
        setError(null);

        try {
            const callbackBaseUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/api/callbacks`
                : 'http://localhost:3000/api/callbacks';

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/inscripcions/historial`,
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
                throw new Error(data.message || "Error al cargar historial");
            }

            if (data.jobId) {
                setLoadingMessage("Procesando solicitud...");
                await pollJobStatus(data.jobId);
            } else {
                setHistorial(data);
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
                        setHistorial(callbackData.result);
                        setLoading(false);
                        return;
                    } else if (callbackData.status === 'failed') {
                        throw new Error(callbackData.error || 'Error procesando la solicitud');
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
                        setHistorial(statusData.result);
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

    const toggleInscripcion = (id: number) => {
        setInscripcionExpandida(inscripcionExpandida === id ? null : id);
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerEstadoMateria = (nota: number | null) => {
        if (nota === null) return 'inscrito';
        if (nota >= 51) return 'aprobado';
        return 'reprobado';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Historial de Inscripciones
            </h2>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">{loadingMessage}</p>
                </div>
            ) : !historial ? (
                <div className="text-center py-8">
                    <button
                        onClick={cargarHistorial}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Cargar Historial de Inscripciones
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex-1"></div>
                        <button
                            onClick={cargarHistorial}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Actualizar
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Estudiante:</span>{" "}
                                    {historial.estudiante.nombre}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">CI:</span>{" "}
                                    {historial.estudiante.ci}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Registro:</span>{" "}
                                    {historial.estudiante.registro}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Total Inscripciones:</span>{" "}
                                    {historial.inscripciones.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {historial.inscripciones.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="text-gray-600">No tienes inscripciones registradas</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historial.inscripciones.map((inscripcion) => (
                                <div
                                    key={inscripcion.id}
                                    className="border rounded-lg overflow-hidden transition-all hover:shadow-md"
                                >
                                    <button
                                        onClick={() => toggleInscripcion(inscripcion.id)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg
                                                    className="w-6 h-6 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-800">
                                                    Periodo {inscripcion.periodo}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatearFecha(inscripcion.fechaInscripcion)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                {inscripcion.materias.length} materia{inscripcion.materias.length !== 1 ? 's' : ''}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-gray-600 transition-transform ${
                                                    inscripcionExpandida === inscripcion.id ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </button>

                                    {inscripcionExpandida === inscripcion.id && (
                                        <div className="p-4 bg-white border-t">
                                            <div className="space-y-3">
                                                {inscripcion.materias.map((materia) => (
                                                    <div
                                                        key={materia.id}
                                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        {/* Indicador de aprobado/reprobado/inscrito */}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            obtenerEstadoMateria(materia.nota) === 'aprobado'
                                                                ? 'bg-green-100' 
                                                                : obtenerEstadoMateria(materia.nota) === 'reprobado'
                                                                ? 'bg-red-100'
                                                                : 'bg-gray-300'
                                                        }`}>
                                                            {obtenerEstadoMateria(materia.nota) === 'aprobado' ? (
                                                                <svg
                                                                    className="w-4 h-4 text-green-600"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            ) : obtenerEstadoMateria(materia.nota) === 'reprobado' ? (
                                                                <svg
                                                                    className="w-4 h-4 text-red-600"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    className="w-4 h-4 text-gray-600"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <h4 className="font-semibold text-gray-800">
                                                                    {materia.materia.nombre}
                                                                </h4>
                                                                {materia.nota !== null ? (
                                                                    <span className={`px-2 py-1 rounded text-sm font-bold ${
                                                                        obtenerEstadoMateria(materia.nota) === 'aprobado'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {materia.nota}
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700">
                                                                        Inscrito
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                Código: {materia.materia.codigo}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                                                    <svg
                                                                        className="w-3 h-3"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                                        />
                                                                    </svg>
                                                                    Grupo {materia.grupo.sigla}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                                                    <svg
                                                                        className="w-3 h-3"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                        />
                                                                    </svg>
                                                                    {materia.docente.nombre}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}