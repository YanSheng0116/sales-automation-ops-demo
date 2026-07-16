import { useState } from "react";

const WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL;

const INITIAL = {
  name: "", email: "", phone: "", plz: "",
  source: "Website", roof_area: 40, orientation: "S",
  consumption: 4500, wants_battery: true, wants_heat_pump: false,
};

export default function NewLeadModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!open) return null;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email.includes("@") || !/^\d{5}$/.test(form.plz)) {
      setError("Please fill name, a valid email and a 5-digit PLZ.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roof_area: Number(form.roof_area),
          consumption: Number(form.consumption),
        }),
      });
      const data = await r.json();
      setResult(data);
      if (data.status === "created") onCreated();
    } catch {
      setError("Webhook unreachable — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm(INITIAL);
    setResult(null);
    setError(null);
    onClose();
  }

  const input = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm";
  const label = "text-xs font-medium text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {!result ? (
          <>
            <h3 className="text-lg font-semibold mb-4">➕ New Lead</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={label}>Name</label>
                <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className={label}>Email</label>
                <input className={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className={label}>Phone</label>
                <input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div>
                <label className={label}>PLZ</label>
                <input className={input} value={form.plz} onChange={(e) => set("plz", e.target.value)} placeholder="e.g. 10115" />
              </div>
              <div>
                <label className={label}>Source</label>
                <select className={input} value={form.source} onChange={(e) => set("source", e.target.value)}>
                  {["Website", "Meta Ads", "Google Ads", "Trade Fair", "Referral"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Roof area (m²)</label>
                <input type="number" className={input} value={form.roof_area} onChange={(e) => set("roof_area", e.target.value)} />
              </div>
              <div>
                <label className={label}>Orientation</label>
                <select className={input} value={form.orientation} onChange={(e) => set("orientation", e.target.value)}>
                  {["S", "SE", "SW", "E", "W", "N"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={label}>Annual consumption (kWh)</label>
                <input type="number" className={input} value={form.consumption} onChange={(e) => set("consumption", e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.wants_battery} onChange={(e) => set("wants_battery", e.target.checked)} />
                Battery
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.wants_heat_pump} onChange={(e) => set("wants_heat_pump", e.target.checked)} />
                Heat pump
              </label>
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={handleClose} className="text-sm px-4 py-2 rounded-lg border border-slate-300">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
              >
                {submitting ? "Scoring lead…" : "Create lead"}
              </button>
            </div>
          </>
        ) : result.status === "created" ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">{result.priority?.split(" ")[0] ?? "✅"}</div>
            <h3 className="text-lg font-semibold">Lead created & scored</h3>
            <div className="grid grid-cols-2 gap-3 mt-5 text-left">
              <Stat label="Score" value={result.score} />
              <Stat label="Priority" value={result.priority} />
              <Stat label="Assigned to" value={result.assigned_to} />
              <Stat label="Region" value={result.region} />
              <Stat label="Monthly rent" value={`€${result.monthly_rent}`} />
              <Stat label="Savings / yr" value={`€${result.annual_savings}`} />
            </div>
            <button onClick={handleClose} className="mt-6 text-sm px-4 py-2 rounded-lg bg-slate-900 text-white">
              Done
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold">
              {result.status === "duplicate" ? "Duplicate lead" : "Something went wrong"}
            </h3>
            <p className="text-sm text-slate-500 mt-2">{result.message}</p>
            <button onClick={handleClose} className="mt-6 text-sm px-4 py-2 rounded-lg border border-slate-300">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}