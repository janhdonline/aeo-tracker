import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("authorization");
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id")
      .eq("active", true);
      
    if (error || !projects) {
      return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL")!;
    const results = [];
    
    for (const project of projects) {
      try {
        const response = await fetch(`${appUrl}/api/scan/run`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cronSecret}`,
          },
          body: JSON.stringify({ projectId: project.id }),
        });
        
        const result = await response.json();
        results.push({ projectId: project.id, success: response.ok, ...result });
      } catch (err) {
        results.push({ projectId: project.id, success: false, error: String(err) });
      }
    }
    
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});