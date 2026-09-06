import usersData from '../../data/users.json';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(422).json({ success: false, message: 'Email and password are required.' });
  }

  // Check if email matches real registered users in DB
  const existing = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  const user = existing || {
    id: 'TVS-USR-' + Date.now().toString(16).toUpperCase(),
    email: email,
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    role: 'Agri Underwriter',
    branch: 'Raipur Central Hub',
    is_active: 1
  };

  return res.status(200).json({
    success: true,
    token: 'tvs_session_' + Buffer.from(user.email).toString('base64'),
    user: {
      user_id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branch: user.branch || 'Raipur Central Hub'
    }
  });
}
