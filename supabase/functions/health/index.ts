// Minimal health check for Step 6 (backend apps). Call from CI or load balancer.
// GET /health -> { "status": "ok", "service": "lunaverse-supabase" }

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  return new Response(
    JSON.stringify({ status: "ok", service: "lunaverse-supabase" }),
    { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
  );
});
