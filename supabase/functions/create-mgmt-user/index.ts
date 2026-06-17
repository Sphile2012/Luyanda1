import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const EMAIL = "poomeigh503@gmail.com";
  const PASSWORD = "Manager2024!";

  // Create user via raw admin API
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
      "apikey": serviceKey,
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin User" },
    }),
  });

  const createData = await createRes.json();

  if (!createRes.ok) {
    return new Response(JSON.stringify({ step: "create_user", status: createRes.status, body: createData }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const userId = createData.id;

  // Upsert profile with management role
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
      "apikey": serviceKey,
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      email: EMAIL,
      full_name: "Admin User",
      role: "management",
    }),
  });

  const profileData = profileRes.ok ? "ok" : await profileRes.text();

  return new Response(
    JSON.stringify({ success: true, userId, profileStatus: profileData }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
