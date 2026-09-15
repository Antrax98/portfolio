import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/config';
import type { ApiResponse } from '@/lib/api/transport';
import type { IssuedToken } from '@/lib/api/schemas';

export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) => proxyHandler(req);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;

//guasrdia para que el proxy no se use mal
function validEndpoint(endpoint: string | null): endpoint is string {
  if (!endpoint || !endpoint.startsWith('/')) return false;
  if (endpoint.includes('..') || endpoint.includes('//')) return false;
  return true;
}

function setSession(res: NextResponse, valor: string, maxAge: number): void {
  res.cookies.set(SESSION_COOKIE, valor, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

async function proxyHandler(req: NextRequest): Promise<NextResponse> {
  const endpoint = new URL(req.url).searchParams.get('endpoint');
  if (!validEndpoint(endpoint)) {
    return NextResponse.json({ message: 'endpoint invalido' }, { status: 400 });
  }

  const noBody = req.method === 'GET' || req.method === 'HEAD';
  const rawBody = noBody ? undefined : await req.text();

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const r = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: rawBody || undefined,
  });

  if (r.status === 204) return new NextResponse(null, { status: 204 });

  const sobre = (await r
    .json()
    .catch(() => null)) as ApiResponse<IssuedToken> | null;
  const res = NextResponse.json(sobre, { status: r.status });

  if (endpoint === '/auth/login' && r.ok && sobre?.data?.token) {
    setSession(res, sobre.data.token, SESSION_MAX_AGE);
  }

  return res;
}
