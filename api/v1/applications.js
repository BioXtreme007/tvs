import applicationsData from '../data/applications.json';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { limit = 60, offset = 0, district, status, search } = req.query || {};
    let apps = [...applicationsData.applications];

    if (district) {
      apps = apps.filter(a => a.district?.toLowerCase() === district.toLowerCase());
    }
    if (status) {
      apps = apps.filter(a => a.status?.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(a =>
        a.applicant_name?.toLowerCase().includes(q) ||
        a.district?.toLowerCase().includes(q) ||
        a.village?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q)
      );
    }

    const total = apps.length;
    const paginated = apps.slice(Number(offset), Number(offset) + Number(limit));

    return res.status(200).json({
      total,
      applications: paginated
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve applications', detail: String(err) });
  }
}
