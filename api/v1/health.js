export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'ok', service: 'GeoKisaan Smart Lending Hub', mode: 'demo', version: '1.0.0' });
}
