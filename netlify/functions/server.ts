import { API_BASE, API_TOKEN } from "./constants";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const handler = async (event: any) => {
  const { endpoint, param, query, toolId } = event.queryStringParameters || {};

  if (!endpoint || !param || !query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing parameters" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  try {
    let combinedResults: any = {
      status: "success",
      data: [],
      osint: {
        reputation: 0,
        found: [],
        summary: "",
      },
    };

    // 1. Call Leaksights API
    const targetUrl = `${API_BASE}${endpoint}?${param}=${encodeURIComponent(query)}&token=${API_TOKEN}`;
    
    try {
      const lsResponse = await fetch(targetUrl, {
        headers: {
          accept: "*/*",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        },
      });

      if (lsResponse.ok) {
        const lsData = await lsResponse.json();
        combinedResults.data = lsData;
        
        if (endpoint.startsWith("/osint/")) {
           if (Array.isArray(lsData)) {
             lsData.forEach((item: any) => {
               combinedResults.osint.found.push({
                 platform: item.source || item.url || "LeakSight Leak",
                 status: "Found",
                 details: item.data || item.password || ""
               });
             });
           }
        }
      }
    } catch (lsError) {
      console.error("LeakSight API error:", lsError);
    }

    // 2. Call Local OSINT Engine
    if (toolId === "username" || toolId === "phone" || toolId === "mailosint" || toolId === "username2") {
      let type = "username";
      if (query.includes("@")) type = "email";
      else if (toolId === "phone") type = "phone";

      try {
        const scriptPath = path.resolve(process.cwd(), "src/lib/osint_engine.py");
        const { stdout } = await execAsync(
          `python3 ${scriptPath} ${type} "${query.replace(/"/g, '\\"')}"`,
        );

        const engineData = JSON.parse(stdout);
        combinedResults.osint.reputation = Math.max(combinedResults.osint.reputation, engineData.reputation);
        
        if (engineData.findings) {
          engineData.findings.forEach((f: any) => {
            combinedResults.osint.found.push(f);
          });
        }
        
        combinedResults.osint.summary = engineData.summary || `Encontrados ${combinedResults.osint.found.length} registros vinculados.`;
      } catch (e) {
        console.error("Engine execution error:", e);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(combinedResults),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Proxy error",
        details: error instanceof Error ? error.message : String(error),
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
