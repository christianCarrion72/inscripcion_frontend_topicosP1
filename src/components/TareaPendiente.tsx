"use client";

import { useState } from "react";

interface TareaPendienteProps {
    tarea: {
        jobId: string;
        mensaje: string;
        notificationEndpoint: string;
    };
    onConsultar: (jobId: string) => Promise<void>;
}

export default function TareaPendiente({ tarea, onConsultar }: TareaPendienteProps) {
    const [consultando, setConsultando] = useState(false);

    const handleConsultar = async () => {
        setConsultando(true);
        try {
            await onConsultar(tarea.jobId);
        } finally {
            setConsultando(false);
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <svg
                        className="w-12 h-12 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                        Inscripción en Proceso
                    </h3>
                    <p className="text-blue-700 mb-4">
                        {tarea.mensaje}
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            ID de Tarea:
                        </p>
                        <code className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-800 break-all block font-mono">
                            {tarea.jobId}
                        </code>
                    </div>
                    <p className="text-sm text-blue-600 mb-4">
                        Tu solicitud está siendo procesada. Haz clic en el botón para consultar el estado.
                    </p>
                    <button
                        onClick={handleConsultar}
                        disabled={consultando}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {consultando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Consultando...
                            </>
                        ) : (
                            <>
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
                                Consultar Estado
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}