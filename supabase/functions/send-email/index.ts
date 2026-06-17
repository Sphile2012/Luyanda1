import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type EmailPayload = {
  type: "buyer_confirmation" | "agent_confirmation" | "agent_approved";
  to: string;
  name: string;
  data?: Record<string, string>;
};

function buyerConfirmationHtml(name: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#1e3a5f;padding:32px 40px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">Drive Agency</h1>
        <p style="color:#93c5fd;margin:8px 0 0;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">South Africa</p>
      </div>
      <div style="padding:40px">
        <h2 style="color:#111827;margin:0 0 16px;font-size:20px">Hi ${name},</h2>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 16px">
          Thank you for submitting your car inquiry with <strong>Drive Agency</strong>. We have received your request and one of our agents will be in touch with you within <strong>24 hours</strong>.
        </p>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 24px">
          We'll handle everything — from finding the right vehicle to sorting the paperwork. You just show up and drive.
        </p>
        <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:4px;padding:16px 20px;margin:0 0 24px">
          <p style="color:#1e40af;margin:0;font-size:14px;font-weight:600">What happens next?</p>
          <p style="color:#3b82f6;margin:8px 0 0;font-size:14px;line-height:1.6">
            1. Our team reviews your request<br>
            2. An agent contacts you to discuss your needs<br>
            3. We find vehicles that match your budget and preferences<br>
            4. You sign and drive
          </p>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin:0">Need help? Call us on <strong style="color:#111827">066 426 8711</strong></p>
      </div>
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">&copy; ${new Date().getFullYear()} Drive Agency South Africa. All rights reserved.</p>
      </div>
    </div>
  `;
}

function agentConfirmationHtml(name: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#1e3a5f;padding:32px 40px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">Drive Agency</h1>
        <p style="color:#93c5fd;margin:8px 0 0;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">South Africa</p>
      </div>
      <div style="padding:40px">
        <h2 style="color:#111827;margin:0 0 16px;font-size:20px">Hi ${name},</h2>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 16px">
          Thank you for applying to join <strong>Drive Agency</strong> as an agent. We have received your application and our team will review it within <strong>48 hours</strong>.
        </p>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 24px">
          We'll be in touch to discuss the next steps in the process.
        </p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px;padding:16px 20px;margin:0 0 24px">
          <p style="color:#15803d;margin:0;font-size:14px;font-weight:600">Application process:</p>
          <p style="color:#16a34a;margin:8px 0 0;font-size:14px;line-height:1.6">
            1. Application review (48 hours)<br>
            2. Phone interview with hiring manager<br>
            3. Skills assessment<br>
            4. Final interview and offer<br>
            5. Onboarding and training
          </p>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin:0">Questions? Call us on <strong style="color:#111827">066 426 8711</strong></p>
      </div>
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">&copy; ${new Date().getFullYear()} Drive Agency South Africa. All rights reserved.</p>
      </div>
    </div>
  `;
}

function agentApprovedHtml(name: string, role: string) {
  const roleLabel = role === "remote_agent" ? "Remote Agent" : "In-Office Agent";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#1e3a5f;padding:32px 40px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">Drive Agency</h1>
        <p style="color:#93c5fd;margin:8px 0 0;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">South Africa</p>
      </div>
      <div style="padding:40px">
        <h2 style="color:#111827;margin:0 0 16px;font-size:20px">Congratulations, ${name}!</h2>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 16px">
          Your Drive Agency account has been <strong style="color:#16a34a">approved</strong>. You have been onboarded as a <strong>${roleLabel}</strong>.
        </p>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 24px">
          You can now log in to your Agent Portal to access your dashboard, view leads, and start closing deals.
        </p>
        <div style="text-align:center;margin:0 0 24px">
          <a href="https://driveagency.co.za/portal" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;font-size:15px">
            Go to Agent Portal →
          </a>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin:0">Need help? Call us on <strong style="color:#111827">066 426 8711</strong></p>
      </div>
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">&copy; ${new Date().getFullYear()} Drive Agency South Africa. All rights reserved.</p>
      </div>
    </div>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    // Log but don't fail — email sending is non-critical
    console.warn("RESEND_API_KEY not configured. Email not sent.");
    return new Response(JSON.stringify({ success: true, note: "Email service not configured" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as EmailPayload;
    const { type, to, name, data = {} } = payload;

    let subject = "";
    let html = "";

    if (type === "buyer_confirmation") {
      subject = "Your Car Inquiry — Drive Agency";
      html = buyerConfirmationHtml(name);
    } else if (type === "agent_confirmation") {
      subject = "Application Received — Drive Agency";
      html = agentConfirmationHtml(name);
    } else if (type === "agent_approved") {
      subject = "Your Account Has Been Approved — Drive Agency";
      html = agentApprovedHtml(name, data.role ?? "");
    } else {
      return new Response(JSON.stringify({ error: "Unknown email type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Drive Agency <noreply@driveagency.co.za>",
        to: [to],
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ success: false, error: result }), {
        status: 200, // don't surface email errors to clients
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
