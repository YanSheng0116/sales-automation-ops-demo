import { useState, useEffect } from "react";

const PRIORITY_STYLES = {
  "🔥 Hot": "bg-red-100 text-red-700",
  "🌤 Warm": "bg-amber-100 text-amber-700",
  "❄️ Cold": "bg-sky-100 text-sky-700",
};

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then(setLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-slate-500">Loading leads…</p>;
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        ☀️ Solar Sales Ops — Lead Pipeline
      </h1>
      <div className="grid gap-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-slate-900">{lead.Name}</div>
              <div className="text-sm text-slate-500">
                {lead.Region} · {lead.Assigned_To} · Score {lead.Lead_Score}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  PRIORITY_STYLES[lead.Priority] ?? "bg-slate-100"
                }`}
              >
                {lead.Priority}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {lead.Status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}