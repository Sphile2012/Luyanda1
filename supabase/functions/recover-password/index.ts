import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sha256hex(str: string): Promise<string> {
  const data = new TextEncoder().encode(str.toLowerCase().trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, answer_1, answer_2, new_password } = await req.json();

    if (!email || !answer_1 || !answer_2 || !new_password) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new_password.length < 8) {
      return new Response(
        JSON.stringify({ error: "New password must be at least 8 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Lookup user_id by email via profiles table
    const { data: profileRow, error: profileErr } = await adminClient
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();

    if (profileErr || !profileRow) {
      return new Response(
        JSON.stringify({ error: "No account found with that email address." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch stored answer hashes
    const { data: sq, error: sqErr } = await adminClient
      .from("security_questions")
      .select("answer_1_hash, answer_2_hash")
      .eq("user_id", profileRow.id)
      .single();

    if (sqErr || !sq) {
      return new Response(
        JSON.stringify({ error: "No security questions are set up for this account. Please use the email reset option." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify both answers
    const [hash1, hash2] = await Promise.all([sha256hex(answer_1), sha256hex(answer_2)]);

    if (hash1 !== sq.answer_1_hash || hash2 !== sq.answer_2_hash) {
      return new Response(
        JSON.stringify({ error: "One or more security answers are incorrect. Please try again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset the password
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(profileRow.id, {
      password: new_password,
    });

    if (updateErr) {
      throw updateErr;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
