export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const token = process.env.ADMIN_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers: cors });

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
};

export const config = { path: "/api/auth" };
