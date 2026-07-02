/* ── Shared Article Store ─────────────────────────────────────────────
   Fetches from /api/articles (Netlify Blobs) on init, falls back to
   localStorage so the site works offline / during local dev without
   netlify dev running.
──────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "sj_articles";

const SEED_ARTICLES = [
  {
    id: "launch-start-here",
    title: "I build things quietly. That stops today.",
    slug: "start-here",
    date: "2026-07-01",
    tags: ["building-in-public", "ai", "cloud", "engineering"],
    excerpt:
      "Why I'm starting this blog, what I'll write about, and what to expect.",
    cover: "/images/blog-cover.png",
    content: `<p>I have shipped award-winning AI products, production cloud systems, and seven websites of my own. Almost none of it is written down. This blog fixes that.</p>

<p>For the last two years I have been heads-down building. Cloud-native data platforms and backend systems by day. AI products by night: RetainIQ, a knowledge-risk platform that won the Innovation category at Amazon AIdeaS 2026. Seven production sites shipped end to end. A research paper on wheat-disease detection published in Elsevier's Procedia Computer Science.</p>

<p>The work is real. The problem is that it lives in private repos, internal wikis, and my own head. When someone asks what I actually do, I do not have a good link to send.</p>

<p>So I am starting here.</p>

<h2>What this blog is</h2>
<p>This is where I show my work. AI and the tools I build with it. The cloud and backend systems underneath. Breakdowns of things I have shipped, the tradeoffs I got wrong the first time, and the ones I would defend in a design review. Plus the parts of the field moving fast enough that they are worth writing about while they are still fresh.</p>

<p>No think-piece filler. If I write about something, I will have built it, broken it, or shipped it.</p>

<h2>What you can expect</h2>
<p>Build logs and architecture breakdowns from real projects: RetainIQ, the sites, whatever I ship next.</p>

<p>Practical AI engineering: RAG that survives production, agents, LLM tooling, and the boring plumbing that actually decides whether a demo becomes a product.</p>

<p>Cloud and backend notes: Azure, Terraform, Kubernetes, Kafka. The patterns that saved me time and the ones that cost me a weekend.</p>

<p>What I am learning as I rebuild my CS fundamentals in public, from data structures to system design.</p>

<h2>The cadence</h2>
<p>One post a week, starting now. Short when short is enough. Long when the topic earns it.</p>

<h2>Why now</h2>
<p>The best engineers I follow all have one thing in common. They build in the open. The compounding is real: a year of writing turns scattered work into a body of work. I would rather start today with one imperfect post than keep waiting for the perfect one.</p>

<p>If you build things, or want to, follow along. I am posting the same journey on Instagram at <a href="https://instagram.com/samyak.space" target="_blank" rel="noopener">@samyak.space</a> and on X at <a href="https://x.com/_samyakk" target="_blank" rel="noopener">@_samyakk</a>.</p>

<p>First real breakdown drops next week: how RetainIQ went from a weekend idea to an Amazon AIdeaS winner, and the architecture that made it work.</p>

<p>Let's build.</p>`,
    published: true,
  },
];

// ── Internal localStorage helpers ─────────────────────────────────────

function localLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ARTICLES));
  return SEED_ARTICLES;
}

function localSave(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

// ── Admin token (set after login) ─────────────────────────────────────

let _adminToken = null;

function setAdminToken(token) {
  _adminToken = token;
}

function authHeaders() {
  const h = { "Content-Type": "application/json" };
  if (_adminToken) h["Authorization"] = `Bearer ${_adminToken}`;
  return h;
}

// ── API helpers ───────────────────────────────────────────────────────

async function apiFetch(method, body, params) {
  const url = params ? `/api/articles?${new URLSearchParams(params)}` : "/api/articles";
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`API ${method} failed: ${res.status}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────

async function init(adminToken) {
  if (adminToken) setAdminToken(adminToken);
  try {
    const articles = await apiFetch(_adminToken ? "GET" : "GET");
    localSave(articles);
    return articles;
  } catch {
    return localLoad();
  }
}

function getAll() {
  return localLoad()
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAllAdmin() {
  return localLoad().sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getBySlug(slug) {
  return localLoad().find((a) => a.slug === slug) || null;
}

async function upsert(article) {
  const saved = await apiFetch(article.id ? "PUT" : "POST", article);
  const all = localLoad();
  const idx = all.findIndex((a) => a.id === saved.id);
  if (idx >= 0) all[idx] = saved;
  else all.push(saved);
  localSave(all);
  return saved;
}

async function remove(id) {
  await apiFetch("DELETE", null, { id });
  localSave(localLoad().filter((a) => a.id !== id));
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

window.ArticleStore = {
  init,
  setAdminToken,
  getAll,
  getAllAdmin,
  getBySlug,
  upsert,
  remove,
  slugify,
  newId,
  formatDate,
};
