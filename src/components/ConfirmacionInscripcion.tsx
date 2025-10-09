"use client";

interface ResultadoInscripcion {
    status: "CONFIRMED" | "REJECTED";
    reason?: string;
    inscripcion?: {
        id: number;
        fechaInscripcion: Date;
    };
    grupos?: number[];
}

interface ConfirmacionInscripcionProps {
    resultado: ResultadoInscripcion;
    onReiniciar: () => void;
}

export default function ConfirmacionInscripcion({ resultado, onReiniciar }: ConfirmacionInscripcionProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {resultado.status === "CONFIRMED" ? (
                <div className="text-center">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 text-green-500 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">
                        ¡Inscripción Exitosa!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Te has inscrito correctamente en {resultado.grupos?.length || 0} materia(s)
                    </p>
                    <button
                        onClick={onReiniciar}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Nueva Inscripción
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 text-red-500 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">
                        Inscripción Fallida
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {resultado.reason || "No se pudo completar la inscripción"}
                    </p>
                    <button
                        onClick={onReiniciar}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Intentar Nuevamente
                    </button>
                </div>
            )}
        </div>
    );
}