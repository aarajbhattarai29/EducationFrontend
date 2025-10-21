import { NextResponse } from 'next/server';
import https from 'http;";

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Disable Next.js caching
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

    // --- Configure fetch options ---
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    // If running locally (self-signed certs allowed)
      // Create HTTPS agent that ignores self-signed certs
    const agent = new https.Agent({
        rejectUnauthorized: false,
      });
    // @ts-ignore
    fetchOptions.agent = agent;
    // --- Make request to FastAPI ---
    const response = await fetch(
      `${FASTAPI_URL}/api/get-token?participant=${encodeURIComponent(participantName)}`,
      fetchOptions
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
    console.error('Error connecting to FastAPI backend:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return new NextResponse(message, { status: 500 });
  }
}
