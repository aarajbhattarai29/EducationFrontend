import { NextResponse } from 'next/server';
import https from 'https';

// FastAPI backend URL - set this in .env.local or Vercel project env vars
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// disable caching
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function POST(req: Request) {
  try {
    const participantName = 'user';

    // --- FIX: allow self-signed certs in dev (rejectUnauthorized: false) ---
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await fetch(
      `${FASTAPI_URL}/api/get-token?participant=${encodeURIComponent(participantName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // add httpsAgent only if it's https
        agent: FASTAPI_URL.startsWith('https://') ? httpsAgent : undefined,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI server error: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();

    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    const data: ConnectionDetails = {
      serverUrl: tokenData.url,
      roomName,
      participantToken: tokenData.token,
      participantName,
    };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error connecting to FastAPI backend:', error);
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Unknown error occurred', { status: 500 });
  }
}
