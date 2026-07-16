export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id, fields } = req.body;
  if (!id || !fields) {
    return res.status(400).json({ error: "Missing id or fields" });
  }
  const r = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Leads/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );
  if (!r.ok) {
    const detail = await r.text();
    return res.status(502).json({ error: "Update failed", detail });
  }
  res.status(200).json(await r.json());
}