"use client";

import React, { useState } from "react";
import { Disclosure } from "@headlessui/react";
import {
  ChevronUpIcon,
  PlayIcon,
  ArrowPathIcon,
} from "@heroicons/react/20/solid";

interface ApiViewerProps {
  apiSpec: any;
}

const BASE_URL = "https://stock.indianapi.in";

function EndpointPlayground({
  apiKey,
  method,
  path,
  details,
}: {
  apiKey: string;
  method: string;
  path: string;
  details: any;
}) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (name: string, value: string) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const url = new URL(BASE_URL + path);
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch(url.toString(), {
        method: method.toUpperCase(),
        headers,
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
        // Try to parse text as JSON just in case, otherwise keep as text
        try {
          data = JSON.parse(data);
        } catch (e) {
          // keep as string
        }
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <PlayIcon className="h-4 w-4 text-blue-600" />
        Try it out
      </h4>

      <div className="space-y-3">
        {details.parameters?.map((param: any) => (
          <div
            key={param.name}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
          >
            <label className="text-xs font-medium text-gray-700 md:text-right md:pr-4">
              {param.name}{" "}
              {param.required && <span className="text-red-500">*</span>}
            </label>
            <div className="md:col-span-3">
              {param.enum ? (
                <select
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                  onChange={(e) =>
                    handleParamChange(param.name, e.target.value)
                  }
                  value={params[param.name] || ""}
                >
                  <option value="">Select...</option>
                  {param.enum.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                  placeholder={param.description || `Enter ${param.name}`}
                  onChange={(e) =>
                    handleParamChange(param.name, e.target.value)
                  }
                  value={params[param.name] || ""}
                />
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-4">
          <button
            onClick={executeRequest}
            disabled={loading}
            className="inline-flex items-center rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              "Execute Request"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span>Status:</span>
            <span
              className={`px-1.5 py-0.5 rounded font-bold ${response.status >= 200 && response.status < 300 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="bg-gray-900 rounded-md p-3 overflow-x-auto max-h-96 overflow-y-auto">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
              {typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiViewer({ apiSpec }: ApiViewerProps) {
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">
          {apiSpec.info.title}
        </h1>
        <p className="text-gray-600 mt-2">Version: {apiSpec.info.version}</p>
        <p className="text-gray-600 mb-6">
          Base URL:{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded">{BASE_URL}</code>
        </p>

        <div className="max-w-md">
          <label
            htmlFor="api-key"
            className="block text-sm font-medium text-gray-700"
          >
            API Key
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="api-key"
              id="api-key"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
              placeholder="Enter your API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Key is required for requests. It is sent as <code>x-api-key</code>{" "}
            header.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(apiSpec.paths).map(([path, methods]: [string, any]) => {
          const method = Object.keys(methods)[0];
          const details: any = Object.values(methods)[0];

          return (
            <div
              key={path}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm"
            >
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                      <div className="flex items-center gap-3">
                        <span
                          className={`uppercase font-bold text-xs px-2 py-1 rounded ${
                            method === "get"
                              ? "bg-blue-100 text-blue-700"
                              : method === "post"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {method}
                        </span>
                        <span className="font-mono text-sm text-gray-700 font-medium">
                          {path}
                        </span>
                        <span className="text-sm text-gray-500 hidden sm:inline-block">
                          - {details.summary}
                        </span>
                      </div>
                      <ChevronUpIcon
                        className={`${open ? "rotate-180 transform" : ""} h-5 w-5 text-gray-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 py-4 text-sm text-gray-500 border-t border-gray-100">
                      {details.description && (
                        <p className="mb-4 text-gray-700">
                          {details.description}
                        </p>
                      )}

                      {details.parameters && details.parameters.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                            Parameters
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                    Name
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                    In
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                    Type
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                    Required
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {details.parameters.map(
                                  (param: any, idx: number) => {
                                    const type =
                                      param.type ||
                                      param.schema?.type ||
                                      (param.schema?.$ref ? "Reference" : "-");
                                    return (
                                      <tr key={idx}>
                                        <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-900">
                                          {param.name}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                                          {param.in}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                                          {type}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                                          {param.required ? (
                                            <span className="text-red-500 font-medium">
                                              Yes
                                            </span>
                                          ) : (
                                            "No"
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  },
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <EndpointPlayground
                        apiKey={apiKey}
                        method={method}
                        path={path}
                        details={details}
                      />
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>
          );
        })}
      </div>
    </div>
  );
}
