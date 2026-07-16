export default function CallQueue({ leads, onMarkContacted }) {
  const queue = leads
    .filter((l) => ["New", "Contacted"].includes(l.Status))
    .map((l) => ({
      ...l,
      _overdue: l.SLA_Status?.includes("Overdue") && l.Status === "New",
      _urgency:
        (l.Lead_Score || 0) +
        (l.SLA_Status?.includes("Overdue") && l.Status === "New" ? 100 : 0),
    }))
    .sort((a, b) => b._urgency - a._urgency)
    .slice(0, 5);

  if (queue.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        📞 Call Queue — next best lead
      </h2>
      <div className="grid gap-2">
        {queue.map((lead, i) => (
          <div
            key={lead.id}
            className={`bg-white rounded-lg border p-4 flex items-center justify-between ${
              lead._overdue ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-slate-400 font-mono text-sm w-6">#{i + 1}</span>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  {lead.Name}
                  {lead._overdue && (
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                      OVERDUE
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500">
                  {lead.Priority} · Score {lead.Lead_Score} · {lead.Assigned_To} ·{" "}
                  {lead.Phone}
                </div>
              </div>
            </div>
            <button
              onClick={() => onMarkContacted(lead)}
              className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700"
            >
              ✓ Mark contacted
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}