// /guests: password-protected RSVP dashboard for Catherine & Greg.
// Cloudflare Pages environment variables (Settings > Variables and Secrets, both Production and Preview):
//   DASHBOARD_PASSWORD  the password Catherine types in
//   DATA_KEY            same long random string as the Apps Script property DATA_KEY
import { TEMPLATE } from '../lib/dashboard-template.js';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzFQvfC1GqmuuE2T5M20t-lKPBHu7QgUBFbeFtDyGVVkTh5lK9LQFEuwes-C0oDbuQEw/exec';
const COOKIE = 'cg_guests';
const DAYS = 30;

const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
function sameText(a, b) {                       // constant-time compare
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const secretOf = (env) => (env.DASHBOARD_PASSWORD || '') + '|' + (env.DATA_KEY || '');

async function makeSession(env) {
  const exp = String(Date.now() + DAYS * 864e5);
  return exp + '.' + await hmac(secretOf(env), exp);
}
async function validSession(request, env) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return sameText(sig, await hmac(secretOf(env), exp));
}

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};
const page = (html, extra = {}, status = 200) => new Response(html, { status, headers: { ...HEADERS, ...extra } });

function loginPage(error) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>RSVPs · Catherine &amp; Greg</title>
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0;background:#F3EFE7;color:#121212}
body{min-height:100vh;display:grid;place-items:center;font:16px/1.55 Jost,"Helvetica Neue",Arial,sans-serif;padding:24px max(20px,env(safe-area-inset-right,0px)) 24px max(20px,env(safe-area-inset-left,0px))}
form{width:100%;max-width:380px;display:flex;flex-direction:column;gap:22px;text-align:center}
.mono{font:400 30px/1 "Cormorant Garamond",Georgia,serif}.mono img{height:.68em;vertical-align:-.02em;margin:0 -.11em 0 -.06em}
h1{margin:0;font:400 48px/1 "Cormorant Garamond",Georgia,serif}
.sub{margin:-8px 0 0;font:italic 19px "Cormorant Garamond",Georgia,serif;color:#5C5A52}
label{display:flex;flex-direction:column;gap:8px;text-align:left;font:500 11px Jost,sans-serif;letter-spacing:.24em;text-transform:uppercase}
input{font:17px Jost,sans-serif;color:#121212;background:transparent;border:0;border-bottom:1px solid #121212;padding:10px 2px;border-radius:0}
input:focus{outline:2px solid #5E6440;outline-offset:2px}
button{height:54px;background:#121212;color:#F3EFE7;border:0;font:12px Jost,sans-serif;letter-spacing:.32em;text-transform:uppercase;cursor:pointer}
button:hover{background:#5E6440}
.err{margin:0;font:italic 18px "Cormorant Garamond",Georgia,serif;color:#8A4B2E}
</style></head><body>
<form method="post" action="/guests">
<div class="mono">C <img src="/images/gpp-amp.svg" alt="&amp;"> G</div>
<h1>RSVPs</h1>
<p class="sub">For Catherine &amp; Greg</p>
<label>Password<input type="password" name="password" autocomplete="current-password" autofocus required></label>
${error ? '<p class="err">That password didn\'t work. Please try again.</p>' : ''}
<button type="submit">Enter</button>
</form></body></html>`;
}

function errorPage(msg) {
  return loginPage(false).replace(/<form[\s\S]*<\/form>/,
    `<div style="text-align:center;max-width:420px"><h1>RSVPs</h1><p class="sub" style="margin-top:12px">${msg}</p></div>`);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.has('logout')) {
    return new Response(null, { status: 303, headers: { Location: '/guests', 'Set-Cookie': `${COOKIE}=; Path=/guests; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (!env.DASHBOARD_PASSWORD || !env.DATA_KEY) return page(errorPage('This page isn\'t set up yet.'), {}, 503);
  if (!(await validSession(request, env))) return page(loginPage(false));

  let data;
  try {
    const r = await fetch(SCRIPT_URL + '?key=' + encodeURIComponent(env.DATA_KEY), { redirect: 'follow' });
    data = await r.json();
  } catch (e) { data = null; }
  if (!data || !data.ok) return page(errorPage('We couldn\'t load the RSVPs just now. Please refresh in a minute.'), {}, 502);

  const safe = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  const html = TEMPLATE
    .replace('DATA_JSON', safe(data.rows || []))
    .replace('SHEET_URL_JSON', safe(data.sheetUrl || ''))
    .replace('GPP_AMP', '/images/gpp-amp.svg');
  return page(html);
}

export async function onRequestPost({ request, env }) {
  if (!env.DASHBOARD_PASSWORD || !env.DATA_KEY) return page(errorPage('This page isn\'t set up yet.'), {}, 503);
  let pw = '';
  try { pw = String((await request.formData()).get('password') || ''); } catch (e) {}
  const ok = sameText(await hmac('pw', pw), await hmac('pw', env.DASHBOARD_PASSWORD));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 900));   // slow down guessing
    return page(loginPage(true), {}, 401);
  }
  const cookie = `${COOKIE}=${await makeSession(env)}; Path=/guests; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
  return new Response(null, { status: 303, headers: { Location: '/guests', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' } });
}
