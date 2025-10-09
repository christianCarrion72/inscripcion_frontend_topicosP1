"use client";

interface LoadingWithProgressProps {
    message: string;
    progress?: number;
    subMessage?: string;
}

export default function LoadingWithProgress({ 
    message, 
    progress, 
    subMessage 
}: LoadingWithProgressProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center justify-center py-12">
                {/* Spinner animado */}
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    {progress !== undefined && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                                {progress}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Mensaje principal */}
                <p className="text-gray-800 text-lg font-semibold mt-6">
                    {message}
                </p>

                {/* Barra de progreso */}
                {progress !== undefined && (
                    <div className="w-full max-w-md mt-4">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Sub-mensaje */}
                {subMessage && (
                    <p className="text-gray-500 text-sm mt-3 text-center max-w-md">
                        {subMessage}
                    </p>
                )}

                {/* Animación de puntos */}
                <div className="flex gap-1 mt-4">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}