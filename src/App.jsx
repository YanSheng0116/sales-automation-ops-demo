import { useState, useEffect, useCallback } from "react";
import { getLeads, updateLead } from "./lib/api";
import StatsBar from "./components/StatsBar";
import CallQueue from "./components/CallQueue";
import KanbanBoard from "./components/KanbanBoard";
import NewLeadModal from "./components/NewLeadModal";

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(() => {
    getLeads()
      .then(setLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkContacted(lead) {
    // optimistic update: UI changes first, API follows, rollback on failure
    const prev = leads;
    setLeads((ls) =>
      ls.map((l) =>
        l.id === lead.id
          ? { ...l, Status: "Contacted", SLA_Status: "✅ Contacted" }
          : l
      )
    );
    try {
      await updateLead(lead.id, {
        Status: "Contacted",
        Last_Contacted: new Date().toISOString(),
      });
    } catch {
      setLeads(prev); // rollback
      alert("Update failed — rolled back.");
    }
  }

  async function handleStatusChange(lead, newStatus) {
    const prev = leads;
    setLeads((ls) =>
      ls.map((l) => (l.id === lead.id ? { ...l, Status: newStatus } : l))
    );
    try {
      await updateLead(lead.id, { Status: newStatus });
    } catch {
      setLeads(prev);
      alert("Update failed — rolled back.");
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading leads…</p>;
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          ☀️ Solar Sales Ops — Lead Pipeline
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          ➕ New Lead
        </button>
      </div>

      <StatsBar leads={leads} />
      <CallQueue leads={leads} onMarkContacted={handleMarkContacted} />
      <KanbanBoard leads={leads} onStatusChange={handleStatusChange} />

      <NewLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </div>
  );
}