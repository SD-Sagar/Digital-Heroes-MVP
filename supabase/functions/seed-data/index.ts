import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const adminEmail = "admin@digitalheroes.com";
    const adminPassword = "Admin123!@#";
    const subscriberEmail = "subscriber@digitalheroes.com";
    const subscriberPassword = "Subscriber123!@#";

    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: "Admin User" },
      app_metadata: { role: "admin" },
    });

    let adminCreated = false;
    if (adminError) {
      if (adminError.message.includes("already")) {
        adminCreated = false;
      } else {
        throw adminError;
      }
    } else {
      adminCreated = true;
      // Profile is auto-created by trigger, but update name and role
      await supabase.from("profiles").upsert({
        id: adminData.user.id,
        email: adminEmail,
        name: "Admin User",
        role: "admin",
      });
    }

    // Create subscriber user
    const { data: subData, error: subError } = await supabase.auth.admin.createUser({
      email: subscriberEmail,
      password: subscriberPassword,
      email_confirm: true,
      user_metadata: { name: "Test Subscriber" },
      app_metadata: { role: "subscriber" },
    });

    let subscriberCreated = false;
    if (subError) {
      if (subError.message.includes("already")) {
        subscriberCreated = false;
      } else {
        throw subError;
      }
    } else {
      subscriberCreated = true;
      await supabase.from("profiles").upsert({
        id: subData.user.id,
        email: subscriberEmail,
        name: "Test Subscriber",
        role: "subscriber",
        charity_percentage: 10,
      });

      // Get first charity for the subscriber
      const { data: charity } = await supabase
        .from("charities")
        .select("id")
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (charity) {
        await supabase.from("profiles")
          .update({ selected_charity_id: charity.id })
          .eq("id", subData.user.id);
      }

      // Create subscription for subscriber
      const now = new Date();
      const renewalDate = new Date(now);
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      await supabase.from("subscriptions").insert({
        user_id: subData.user.id,
        plan: "monthly",
        status: "active",
        amount: 499.00,
        start_date: now.toISOString(),
        renewal_date: renewalDate.toISOString(),
      });

      // Create sample scores
      const scoreDates = [
        { score: 32, date: "2026-09-15" },
        { score: 38, date: "2026-09-12" },
        { score: 29, date: "2026-09-08" },
        { score: 35, date: "2026-09-03" },
        { score: 31, date: "2026-08-29" },
      ];

      for (const s of scoreDates) {
        await supabase.from("scores").insert({
          user_id: subData.user.id,
          score: s.score,
          score_date: s.date,
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      admin: { email: adminEmail, password: adminPassword, created: adminCreated },
      subscriber: { email: subscriberEmail, password: subscriberPassword, created: subscriberCreated },
      message: "Seed data ready. Use these credentials to log in.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
