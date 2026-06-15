const http = require('http');

const API = process.env.API_URL || 'http://localhost:4000/api';

const request = (method, path, body, token) => new Promise((resolve, reject) => {
  const payload = body ? JSON.stringify(body) : undefined;
  const url = new URL(`${API}${path}`);
  const req = http.request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      let json = {};
      try {
        json = data ? JSON.parse(data) : {};
      } catch (_) {
        json = { raw: data };
      }

      if (res.statusCode >= 400) {
        reject(new Error(`${method} ${path} failed (${res.statusCode}): ${data}`));
        return;
      }

      resolve(json);
    });
  });

  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

const run = async () => {
  const email = `smoke${Date.now()}@example.com`;

  const health = await request('GET', '/health');
  const signup = await request('POST', '/auth/signup', {
    name: 'Smoke Test',
    email,
    password: 'password123',
  });

  const fund = await request('POST', '/funds', {
    title: 'Smoke Test Fund',
    category: 'Disaster & Emergency Relief',
    description: 'Backend smoke test',
    targetAmount: 1000,
  }, signup.token);

  const donation = await request('POST', '/donations', {
    fundId: fund.fund._id,
    donorName: 'Smoke Test',
    amount: 100,
  }, signup.token);

  console.log(JSON.stringify({
    ok: true,
    api: API,
    health: health.ok,
    tokenCreated: Boolean(signup.token),
    fundStatus: fund.fund.status,
    donationAmount: donation.donation.amount,
  }, null, 2));
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
