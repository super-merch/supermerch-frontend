import React, { useState } from "react";

// PMSColorChart.jsx
// Simple informational PMS (Pantone) color chart page
// - Shows a small set of common PMS colors with approximate HEX values
// - Click a swatch to copy HEX to clipboard (useful for web previews)
// - Notes that these are screen approximations and to consult official Pantone guides for print

const PMS_COLORS = [
  { code: "PMS 185 C", hex: "#C8102E" },
  { code: "PMS 286 C", hex: "#0033A0" },
  { code: "PMS  Process Yellow C", hex: "#FFD100" },
  { code: "PMS 348 C", hex: "#006B3C" },
  { code: "PMS 300 C", hex: "#005EB8" },
  { code: "PMS 165 C", hex: "#FF6A13" },
  { code: "PMS 7427 C", hex: "#9B1B30" },
  { code: "PMS Cool Gray 7 C", hex: "#97999B" },
];

export default function PMSColorChart() {
  const [copied, setCopied] = useState("");

  const copyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            PMS Color Chart
          </h1>
          <p className="text-sm text-gray-500">
            A small set of common Pantone (PMS) colors with approximate
            on-screen HEX values for web previews.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PMS_COLORS.map((c) => (
            <div key={c.code} className="rounded overflow-hidden shadow-sm">
              <div
                role="button"
                tabIndex={0}
                onClick={() => copyHex(c.hex)}
                onKeyDown={(e) => e.key === "Enter" && copyHex(c.hex)}
                className="h-28 flex items-center justify-center"
                style={{ backgroundColor: c.hex }}
                aria-label={`${c.code} swatch, hex ${c.hex}. Click to copy hex`}
              />

              <div className="p-3 bg-white">
                <div className="text-sm font-medium text-gray-800">
                  {c.code}
                </div>
                <div className="text-xs text-gray-500">
                  Approx HEX: <span className="font-mono">{c.hex}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => copyHex(c.hex)}
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                  >
                    Copy HEX
                  </button>

                  <div className="text-xs text-gray-400">
                    {copied === c.hex ? "Copied!" : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 prose prose-sm text-gray-700">
          <p>
            <strong>Note:</strong> These HEX values are <em>approximate</em>{" "}
            screen conversions of Pantone (PMS) colors. For accurate print
            matching use official Pantone guides or request a printed proof.
            Colors may vary between screens and printers.
          </p>

          <p>
            Need a full Pantone list or downloadable swatch PDF? Contact{" "}
            <button
              onClick={() => window.open("mailto:Info@supermerch.com.au")}
              className="text-primary hover:underline"
            >
              Info@supermerch.com.au
            </button>{" "}
            and we can provide printable templates or official references.
          </p>
        </div>
      </div>
    </div>
  );
}
