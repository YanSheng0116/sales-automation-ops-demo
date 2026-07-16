import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

const COLUMNS = ["New", "Contacted", "Qualified", "Quote Sent", "Won", "Lost"];

const COLUMN_STYLES = {
  New: "border-t-sky-400",
  Contacted: "border-t-amber-400",
  Qualified: "border-t-violet-400",
  "Quote Sent": "border-t-orange-400",
  Won: "border-t-green-500",
  Lost: "border-t-slate-300",
};

function LeadCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id, data: { lead } });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-slate-200 p-3 cursor-grab shadow-sm select-none ${
        isDragging ? "opacity-60 shadow-lg z-50 relative" : ""
      }`}
    >
      <div className="font-medium text-slate-900 text-sm">{lead.Name}</div>
      <div className="text-xs text-slate-500 mt-1">
        {lead.Priority} · {lead.Region}
      </div>
      <div className="text-xs text-slate-400 mt-1">
        €{lead.Monthly_Rent_EUR}/mo · {lead.Assigned_To}
      </div>
    </div>
  );
}

function Column({ status, leads }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-100 rounded-lg border-t-4 ${COLUMN_STYLES[status]} p-3 min-h-[200px] transition-colors ${
        isOver ? "bg-slate-200 ring-2 ring-slate-300" : ""
      }`}
    >
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex justify-between">
        <span>{status}</span>
        <span className="text-slate-400">{leads.length}</span>
      </div>
      <div className="grid gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ leads, onStatusChange }) {
  // 8px移动才算拖拽——留出点击空间，之后卡片上要放按钮
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const lead = active.data.current.lead;
    const newStatus = over.id;
    if (lead.Status !== newStatus) {
      onStatusChange(lead, newStatus);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">🗂 Pipeline</h2>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              leads={leads.filter((l) => l.Status === status)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}