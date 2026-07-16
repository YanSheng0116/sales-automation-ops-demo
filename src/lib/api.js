export async function getLeads() {
  const r = await fetch("/api/leads");
  if (!r.ok) throw new Error(`API returned ${r.status}`);
  return r.json();
}

export async function updateLead(id, fields) {
  const r = await fetch("/api/update-lead", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, fields }),
  });
  if (!r.ok) throw new Error(`Update failed: ${r.status}`);
  return r.json();
}