export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, name, role = 'Borrower' } = req.body || {};

  if (!email || !password || !name) {
    return res.status(422).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const user = {
    id: 'TVS-USR-' + Date.now().toString(16).toUpperCase(),
    email,
    name,
    role,
    branch: 'Raipur Central Hub',
    is_active: 1
  };

  return res.status(200).json({
    success: true,
    token: 'tvs_session_' + Buffer.from(email).toString('base64'),
    user
  });
}
