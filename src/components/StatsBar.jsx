export default function StatsBar({ leads }) {
  const active = leads.filter((l) => !["Won", "Lost"].includes(l.Status));
  const hot = active.filter((l) => l.Priority?.includes("Hot")).length;
  const overdue = active.filter((l) => l.SLA_Status?.includes("Overdue")).length;
  const pipelineValue = active.reduce(
    (sum, l) => sum + (l.Monthly_Rent_EUR || 0) * 12,
    0
  );

  const stats = [
    { label: "Active leads", value: active.length },
    { label: "🔥 Hot", value: hot },
    { label: "🔴 SLA overdue", value: overdue },
    { label: "Pipeline value / yr", value: `€${pipelineValue.toLocaleString("de-DE")}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}