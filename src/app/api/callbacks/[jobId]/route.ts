import { NextRequest, NextResponse } from 'next/server';

// Store para mantener callbacks en memoria (en producción usa Redis o similar)
const callbackStore = new Map<string, any>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> } // 👈 params ahora es Promise
) {
  try {
    const body = await request.json();
    const { jobId } = await params; // 👈 await aquí

    console.log(`📥 Callback recibido para job ${jobId}:`, {
      status: body.status,
      hasResult: !!body.result,
      hasError: !!body.error,
    });

    callbackStore.set(jobId, {
      ...body,
      receivedAt: Date.now(),
    });

    if (body.error) {
      console.error(`❌ Job ${jobId} falló:`, body.error);
    } else {
      console.log(`✅ Job ${jobId} completado exitosamente`);
    }

    return NextResponse.json({
      message: 'Callback recibido correctamente',
      jobId,
      status: body.status,
    });
  } catch (error) {
    console.error('Error procesando callback:', error);
    return NextResponse.json(
      {
        error: 'Error procesando callback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> } // 👈 igual aquí
) {
  try {
    const { jobId } = await params; // 👈 y aquí también
    const data = callbackStore.get(jobId);

    if (!data) {
      return NextResponse.json(
        {
          error: 'Job no encontrado en callbacks',
          jobId,
          message: 'El callback aún no ha sido recibido o el jobId es inválido',
        },
        { status: 404 }
      );
    }

    console.log(`📤 Consulta de callback para job ${jobId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo callback:', error);
    return NextResponse.json(
      { error: 'Error obteniendo callback' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> } // 👈 y también aquí
) {
  const { jobId } = await params; // 👈 await aquí
  const existed = callbackStore.delete(jobId);

  return NextResponse.json({
    message: existed ? 'Callback eliminado' : 'Callback no encontrado',
    jobId,
  });
}
