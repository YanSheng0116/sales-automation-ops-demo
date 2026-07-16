export default async function handler(req, res) {
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Leads?pageSize=100`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  });
  if (!r.ok) {
    return res.status(502).json({ error: "Airtable unavailable" });
  }
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=10");
  res.status(200).json(
    data.records.map(({ id, fields }) => ({ id, ...fields }))
  );
}