export const SEED = {
  id: "launch-start-here",
  title: "I build things quietly. That stops today.",
  slug: "start-here",
  date: "2026-07-01",
  tags: ["building-in-public", "ai", "cloud", "engineering"],
  excerpt: "Why I'm starting this blog, what I'll write about, and what to expect.",
  cover: "/images/blog-cover.png",
  content: `<p>I have shipped award-winning AI products, production cloud systems, and seven websites of my own. Almost none of it is written down. This blog fixes that.</p>

<p>For the last two years I have been heads-down building. Cloud-native data platforms and backend systems by day. AI products by night: RetainIQ, a customer-retention platform that won the Innovation category at Amazon AIdeaS 2026. Seven production sites shipped end to end. A research paper on wheat-disease detection published in Elsevier's Procedia Computer Science.</p>

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
};

export async function getAll(store) {
  const { blobs } = await store.list();
  if (blobs.length === 0) {
    await store.set(SEED.id, JSON.stringify(SEED));
    return [SEED];
  }
  const items = await Promise.all(blobs.map(({ key }) => store.get(key, { type: "json" })));
  return items.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPublished(store) {
  const all = await getAll(store);
  return all.filter((a) => a.published);
}

export async function getBySlug(store, slug) {
  const all = await getAll(store);
  return all.find((a) => a.slug === slug) || null;
}

export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export const escapeAttr = escapeHtml;
