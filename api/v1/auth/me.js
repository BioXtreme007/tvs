import usersData from '../../data/users.json';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (token && token.startsWith('tvs_session_')) {
    try {
      const email = Buffer.from(token.replace('tvs_session_', ''), 'base64').toString('utf-8');
      const user = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        id: 'TVS-USR-1001',
        email,
        name: 'Agri Officer',
        role: 'Agri Underwriter',
        branch: 'Raipur Central Hub'
      };
      return res.status(200).json({ user });
    } catch {
      // ignore
    }
  }

  // Default to prime underwriter
  return res.status(200).json({
    user: usersData.users[0]
  });
}
