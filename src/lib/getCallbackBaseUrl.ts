export function getCallbackBaseUrl(): string {
  // En cliente: usar el dominio actual (incluye protocolo)
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/callbacks`;
  }

  // En servidor: usar variable de entorno o localhost
  const origin = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  return `${origin.replace(/\/$/, "")}/api/callbacks`;
}