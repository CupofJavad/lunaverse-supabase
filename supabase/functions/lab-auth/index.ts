// Step 4: Lab page protection. POST { "password": "..." }.
// If password matches LAB_PASSWORD secret, returns { "ok": true }. Else 401.
// Set secret: supabase secrets set LAB_PASSWORD=your-lab-password
// Front end: show password form, POST here, if ok then redirect to /hub/lab.html or set cookie.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  const expected = Deno.env.get("LAB_PASSWORD");
  if (!expected) {
    return new Response(
      JSON.stringify({ error: "Lab auth not configured (LAB_PASSWORD)" }),
      { status: 503, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  const password = body?.password ?? "";
  if (password !== expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid password" }),
      { status: 401, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
  );
});
