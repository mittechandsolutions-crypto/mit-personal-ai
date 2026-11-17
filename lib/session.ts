import { randomUUID } from "node:crypto";

const cookieName = "mit_session";
const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getSession(request: Request) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const sessionCookie = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${cookieName}=`));
  const existingId = sessionCookie?.slice(cookieName.length + 1);
  if (existingId && sessionPattern.test(existingId)) return { id: existingId, setCookie: null };

  const id = randomUUID();
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return {
    id,
    setCookie: `${cookieName}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`
  };
}

export function setSessionCookie(response: Response, cookie: string | null) {
  if (cookie) response.headers.append("Set-Cookie", cookie);
  return response;
}
