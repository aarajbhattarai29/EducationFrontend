import { NextResponse } from 'next/server';

// FastAPI backend URL - you should define this in your .env.local
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function POST(req: Request) {
  try {
    // Parse agent configuration from request body
    const body = await req.json();
    // const agentName: string = body?.room_config?.agents?.[0]?.agent_name;

    // Generate participant name (keeping same logic)
    const participantName = 'user';
    // const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
  
    // Call FastAPI backend to get token
    const response = await fetch(
      `${FASTAPI_URL}/api/get-token?participant=${encodeURIComponent(participantName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // For development with self-signed certificates
        // Remove this in production with proper SSL certificates
        // ...(process.env.NODE_ENV === 'development' && {
        //   agent: new (require('https').Agent)({
        //     rejectUnauthorized: false,
        //   }),
        // }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI server error: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();

    // Extract room name from the token (you might need to decode JWT to get this)
    // For now, using a generated room name similar to original logic
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    // Return connection details in the same format
    const data: ConnectionDetails = {
      serverUrl: tokenData.url,
      roomName,
      participantToken: tokenData.token,
      participantName,
    };

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });

    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error connecting to FastAPI backend:', error);
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Unknown error occurred', { status: 500 });
  }
}
