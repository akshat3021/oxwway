#!/usr/bin/env node
/**
 * Post-deploy smoke test against a RUNNING server (staging or local).
 *
 *   SMOKE_ADMIN_EMAIL=... SMOKE_ADMIN_PASSWORD=... npm run smoke -- https://staging.example.com
 *
 * Walks the real journey: auth, role rules, publish workflow, public visibility,
 * XSS safety, headers, contact form. Creates only clearly-named temporary
 * content and removes it afterwards. Exit code 0 = all checks passed.
 * Do not point at production unless you accept a few temporary records.
 */
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) {
  console.error("Set SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD");
  process.exit(2);
}

const stamp = Date.now().toString(36);
const origin = new URL(base).origin;
let failures = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${!ok && extra ? `  → ${extra}` : ""}`);
  if (!ok) failures++;
};

async function call(method, path, { cookie, json, headers = {}, sendOrigin = true } = {}) {
  const res = await fetch(base + path, {
    method,
    redirect: "manual",
    headers: {
      ...(json !== undefined ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      ...(sendOrigin ? { origin } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* html */ }
  return { status: res.status, headers: res.headers, text, body, data: body?.data };
}

const sessionCookie = (res) => (res.headers.get("set-cookie") ?? "").split(";")[0];

async function login(email, password) {
  const r = await call("POST", "/api/auth/login", { json: { email, password } });
  return { r, cookie: sessionCookie(r) };
}

const section = (t) => console.log(`\n${t}`);

(async () => {
  console.log(`Smoke testing ${base}`);

  section("Health & headers");
  const health = await call("GET", "/api/health");
  check("liveness /api/health → 200", health.status === 200);
  const ready = await call("GET", "/api/ready");
  check("readiness /api/ready → 200 (database reachable)", ready.status === 200);
  const home = await call("GET", "/");
  check("home page → 200", home.status === 200);
  const h = home.headers;
  check("CSP header present, no unsafe-eval", (h.get("content-security-policy") ?? "").includes("default-src 'self'") && !(h.get("content-security-policy") ?? "").includes("unsafe-eval"));
  check("clickjacking protection (X-Frame-Options + frame-ancestors)", h.get("x-frame-options") === "DENY" && (h.get("content-security-policy") ?? "").includes("frame-ancestors 'none'"));
  check("nosniff + referrer policy + HSTS", h.get("x-content-type-options") === "nosniff" && !!h.get("referrer-policy") && !!h.get("strict-transport-security"));
  check("no X-Powered-By", !h.get("x-powered-by"));
  check("home HTML is server-rendered (hero text present)", home.text.includes("OXWAY"));
  check("no Google Fonts requests", !home.text.includes("fonts.googleapis.com"));

  section("Admin is closed to anonymous visitors");
  const anonAdmin = await call("GET", "/admin");
  check("/admin without cookie → redirected to login", anonAdmin.status >= 300 && anonAdmin.status < 400 && (anonAdmin.headers.get("location") ?? "").includes("/admin/login"));
  const fakeCookieAdmin = await call("GET", "/admin", { cookie: "oxway_session=forged; __Host-oxway_session=forged" });
  check("/admin with a FORGED cookie → still redirected (server validates session)", fakeCookieAdmin.status >= 300 && fakeCookieAdmin.status < 400 && (fakeCookieAdmin.headers.get("location") ?? "").includes("/admin/login"));
  const anonApi = await call("GET", "/api/admin/blog-posts");
  check("admin API without session → 401", anonApi.status === 401);
  const forged = await call("GET", "/api/admin/blog-posts", { cookie: 'oxway_session={"email":"x","role":"admin"}; __Host-oxway_session={"email":"x","role":"admin"}' });
  check("admin API with a forged JSON cookie (the old exploit) → 401", forged.status === 401);
  const robots = await call("GET", "/robots.txt");
  check("robots.txt disallows /admin", robots.text.includes("Disallow: /admin"));

  section("Authentication");
  const bad = await call("POST", "/api/auth/login", { json: { email: adminEmail, password: "definitely-not-the-password" } });
  check("wrong password → 401 generic", bad.status === 401 && bad.body?.error?.code === "UNAUTHENTICATED");
  const csrf = await call("POST", "/api/auth/login", { json: { email: adminEmail, password: adminPassword }, headers: { origin: "https://evil.example" } });
  check("login from a foreign Origin → 403 (CSRF)", csrf.status === 403);
  const { r: loginRes, cookie: admin } = await login(adminEmail, adminPassword);
  check("admin login → 200", loginRes.status === 200, JSON.stringify(loginRes.body));
  const sc = loginRes.headers.get("set-cookie") ?? "";
  check("session cookie is HttpOnly + SameSite", /HttpOnly/i.test(sc) && /SameSite=Lax/i.test(sc));
  check("response never contains a password hash", !loginRes.text.toLowerCase().includes("passwordhash"));
  if (!admin) { console.error("Cannot continue without an admin session"); process.exit(1); }
  const panel = await call("GET", "/admin", { cookie: admin });
  check("/admin with a real session → 200", panel.status === 200);

  section("Editor role restrictions");
  const editorEmail = `smoke-editor-${stamp}@example.com`;
  const editorPw = `smoke-passphrase-${stamp}-xyz`;
  const mk = await call("POST", "/api/admin/users", { cookie: admin, json: { email: editorEmail, name: "Smoke Editor", role: "editor", password: editorPw } });
  check("admin creates an editor", mk.status === 201, JSON.stringify(mk.body));
  const editorId = mk.data?.id;
  const { cookie: editor } = await login(editorEmail, editorPw);
  check("editor can sign in", !!editor);
  const usersAsEditor = await call("GET", "/api/admin/users", { cookie: editor });
  check("editor cannot list users → 403", usersAsEditor.status === 403);
  const auditAsEditor = await call("GET", "/api/admin/audit", { cookie: editor });
  check("editor cannot read audit log → 403", auditAsEditor.status === 403);

  section("Content workflow & public visibility");
  const slug = `smoke-post-${stamp}`;
  const body = "Hello **world**.\n\n<script>alert('xss')</script>\n\n[bad link](javascript:alert(1)) and [good link](https://example.com/ok)";
  const draft = await call("POST", "/api/admin/blog-posts", { cookie: editor, json: { title: `Smoke ${stamp}`, slug, excerpt: "smoke excerpt", body, tags: ["smoke"] } });
  check("editor creates a draft post", draft.status === 201 && draft.data?.status === "draft", JSON.stringify(draft.body));
  const postId = draft.data?.id;
  const pubByEditor = await call("PATCH", `/api/admin/blog-posts/${postId}`, { cookie: editor, json: { status: "published" } });
  check("editor cannot publish → 403", pubByEditor.status === 403);
  const delByEditor = await call("DELETE", `/api/admin/blog-posts/${postId}`, { cookie: editor });
  check("editor cannot delete → 403", delByEditor.status === 403);
  const mass = await call("POST", "/api/admin/blog-posts", { cookie: admin, json: { title: "x", slug: `mass-${stamp}`, deletedAt: null } });
  check("unknown field (mass assignment) → 422", mass.status === 422);
  const xssUrl = await call("POST", "/api/admin/blog-posts", { cookie: admin, json: { title: "x", slug: `xss-${stamp}`, coverImage: "javascript:alert(1)" } });
  check("javascript: cover image URL → 422", xssUrl.status === 422);

  const draftPage = await call("GET", `/blog/${slug}`);
  check("draft is NOT publicly visible → 404", draftPage.status === 404);
  const list0 = await call("GET", "/blog");
  check("draft not in public blog list", !list0.text.includes(`Smoke ${stamp}`));

  const pub = await call("PATCH", `/api/admin/blog-posts/${postId}`, { cookie: admin, json: { status: "published" } });
  check("admin publishes", pub.status === 200 && !!pub.data?.publishDate);
  const page = await call("GET", `/blog/${slug}`);
  check("published post is publicly visible", page.status === 200 && page.text.includes(`Smoke ${stamp}`));
  check("XSS: <script> from the body is not rendered as markup", !page.text.includes("<script>alert('xss')</script>"));
  check("XSS: javascript: link is not rendered", !/href="javascript:/i.test(page.text));
  check("safe https link IS rendered", page.text.includes('href="https://example.com/ok"'));
  const landing = await call("GET", "/");
  check("admin change appears on the landing page immediately", landing.text.includes(`Smoke ${stamp}`));

  const team = await call("POST", "/api/admin/team-members", { cookie: editor, json: { name: `Smoke Person ${stamp}`, role: "Tester", displayOrder: 999 } });
  check("editor adds a team member", team.status === 201);
  const teamPage = await call("GET", "/team");
  check("team member appears on /team", teamPage.text.includes(`Smoke Person ${stamp}`));

  const hp = await call("PUT", "/api/admin/homepage", { cookie: editor, json: { heroHeadline: `SMOKE${stamp.toUpperCase()}` } });
  check("editor edits homepage hero", hp.status === 200);
  const landing2 = await call("GET", "/");
  check("hero edit is live", landing2.text.includes(`SMOKE${stamp.toUpperCase()}`));
  await call("PUT", "/api/admin/homepage", { cookie: admin, json: { heroHeadline: "" } }); // restore default
  const settingsByEditor = await call("PUT", "/api/admin/settings", { cookie: editor, json: { showBullWatermark: true } });
  check("editor cannot change site settings → 403", settingsByEditor.status === 403);

  section("Contact form");
  const contact = await call("POST", "/api/public/contact", { json: { name: "Smoke", email: `smoke-${stamp}@example.com`, message: "automated smoke test" }, headers: { "x-forwarded-for": `198.51.100.${(Date.now() % 200) + 1}` } });
  check("contact submission accepted", contact.status === 202, JSON.stringify(contact.body));
  const inbox = await call("GET", "/api/admin/messages?pageSize=50", { cookie: admin });
  const mine = (inbox.data ?? []).find((m) => m.email === `smoke-${stamp}@example.com`);
  check("message appears in the admin inbox", !!mine);
  const inboxAsEditor = await call("GET", "/api/admin/messages", { cookie: editor });
  check("editor cannot read the inbox → 403", inboxAsEditor.status === 403);
  if (mine) {
    const del = await call("DELETE", `/api/admin/messages/${mine.id}`, { cookie: admin });
    check("message hard-deleted (erasure)", del.status === 204);
  }

  section("Soft delete & cleanup");
  const del = await call("DELETE", `/api/admin/blog-posts/${postId}`, { cookie: admin });
  check("admin deletes the post", del.status === 204);
  const gone = await call("GET", `/blog/${slug}`);
  check("deleted post disappears from the public site", gone.status === 404);
  const teamList = await call("GET", "/api/admin/team-members?pageSize=100", { cookie: admin });
  for (const m of (teamList.data ?? []).filter((t) => t.name === `Smoke Person ${stamp}`)) {
    await call("DELETE", `/api/admin/team-members/${m.id}`, { cookie: admin });
  }
  const audit = await call("GET", "/api/admin/audit?pageSize=100", { cookie: admin });
  const actions = new Set((audit.data ?? []).map((a) => a.action));
  check("audit log recorded login/create/publish/delete", ["login", "create", "publish", "delete"].every((a) => actions.has(a)));

  section("Session lifecycle");
  const out = await call("POST", "/api/auth/logout", { cookie: editor });
  check("logout → 204", out.status === 204);
  const after = await call("GET", "/api/auth/me", { cookie: editor });
  check("the logged-out cookie no longer works (revoked server-side)", after.status === 401);
  if (editorId) {
    const erase = await call("DELETE", `/api/admin/users/${editorId}`, { cookie: admin });
    check("temporary editor removed", erase.status === 204);
  }
  await call("POST", "/api/auth/logout", { cookie: admin });

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("Smoke test crashed:", e); process.exit(1); });
