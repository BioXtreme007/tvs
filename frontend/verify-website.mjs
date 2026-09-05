import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import React from 'react';
import assert from 'node:assert/strict';

// Render the public routes without a browser or external requests.
await import('framer-motion');
globalThis.window = { location: { hash: '' } };
globalThis.localStorage = { getItem: () => null };
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  for (const route of ['', '#signin', '#farmer']) {
    window.location.hash = route;
    const html = renderToString(React.createElement(App));
    assert.ok(!html.includes('class="sidebar'), 'Public routes must not render the dashboard sidebar');
    if (!route) {
      for (const id of ['home', 'innovations', 'pipeline', 'scenarios', 'underwriting', 'portfolio', 'stress-sim', 'ews', 'krishi-saathi']) {
        assert.ok(html.includes(`id="${id}"`), `Missing original section: ${id}`);
      }
      assert.ok(!html.includes('Play / pause background'));
      assert.ok(!html.includes('welcome-orbit'));
      assert.ok(html.includes('Lending in the field.'));
      assert.ok(html.includes('<video'), 'Original hero video must remain');
      assert.ok(html.includes('Power Smart Agri-Lending'), 'Original hero copy must remain');
      assert.ok(!html.includes('Welcome Back!'), 'Login must not be embedded in the landing page');
    } else if (route === '#signin') {
      assert.ok(html.includes('Welcome Back!'));
      assert.ok(html.includes('Create Account'));
      assert.ok(html.includes('Back to website'));
      assert.ok(!html.includes('id="underwriting"'));
    } else {
      assert.ok(html.includes('Farmer services'));
      assert.ok(html.includes('Back to website'));
    }
    console.log(`PASS ${route || '/'}: restored page renders independently`);
  }
} finally {
  await server.close();
}
