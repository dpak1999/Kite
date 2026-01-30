import React from "react";
import path from "path";
import SwaggerParser from "@apidevtools/swagger-parser";
import ApiViewer from "./ApiViewer";
import fs from "fs";

export default async function ApiReferencePage() {
  const filePath = path.join(process.cwd(), "../../api.json");

  let apiSpec;
  try {
    // dereference resolves all $ref pointers so the UI gets a full object
    const start = Date.now();
    apiSpec = await SwaggerParser.dereference(filePath);
    console.log(`Swagger Parsing took ${Date.now() - start}ms`);
  } catch (e) {
    console.error("Error parsing api.json", e);
    // Fallback: simple read if parser fails, or show error
    try {
      // If dereference fails (e.g. invalid ref), maybe we just show the raw JSON or a partial view
      // But for now, let's show the error.
      if (fs.existsSync(filePath)) {
        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded text-yellow-800">
              <h3 className="font-bold">
                Warning: Could not fully parse Swagger spec
              </h3>
              <p className="text-sm">{String(e)}</p>
            </div>
            <ApiViewer apiSpec={raw} />
          </div>
        );
      }
    } catch (inner) {}

    return (
      <div className="p-6 text-red-600">
        <h2 className="text-lg font-bold">Error loading API Specification</h2>
        <pre className="mt-2 text-sm bg-red-50 p-4 rounded">{String(e)}</pre>
      </div>
    );
  }

  return <ApiViewer apiSpec={apiSpec} />;
}
