import type { APIRoute } from "astro";
import * as cheerio from "cheerio";

// Minimal type defs
type Device = "mobile" | "desktop";

interface CoreWebVitals {
  LCP?: number | null;
  CLS?: number | null;
  INP?: number | null;
}

interface IssueItem {
  id: string;
  severity: "critical" | "warn" | "info";
  message: string;
  fixHint: string;
}

interface SnapshotResponse {
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  statusCode: number | null;
  canonical: string | null;
  robotsMeta: string | null;
  robotsTxtFindings: string[];
  indexable: boolean;
  performanceScore: number | null;
  coreWebVitals: CoreWebVitals;
  mobileFriendly: boolean;
  issues: IssueItem[];
  analyzedAt: string;
  url: string;
}

const isValidHttpUrl = (u: string) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const fetchHTML = async (url: string) => {
  const res = await fetch(url, { redirect: "manual" });
  // follow up to 1 redirect
  if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
    const next = new URL(res.headers.get("location")!, url).toString();
    const res2 = await fetch(next, { redirect: "manual" });
    return { html: await res2.text(), status: res2.status, finalUrl: next };
  }
  return { html: await res.text(), status: res.status, finalUrl: url };
};

const parseHead = ($: cheerio.Root) => {
  const title = ($("title").first().text() || null)?.trim() || null;
  const metaDescription = ($('meta[name="description"]').attr("content") || null)?.trim() || null;
  const canonical = ($('link[rel="canonical"]').attr("href") || null)?.trim() || null;
  const robotsMeta = ($('meta[name="robots"]').attr("content") || null)?.trim() || null;
  const h1 = ($("h1").first().text() || null)?.trim() || null;
  return { title, metaDescription, canonical, robotsMeta, h1 };
};

const analyzeRobotsTxt = async (pageUrl: string): Promise<{ findings: string[]; allowed: boolean }> => {
  try {
    const u = new URL(pageUrl);
    const robotsUrl = `${u.origin}/robots.txt`;
    const res = await fetch(robotsUrl);
    if (!res.ok) return { findings: ["robots.txt not accessible"], allowed: true };
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const path = u.pathname.replace(/\/$/, "");
    let disallows: string[] = [];
    let allows: string[] = [];
    let userAgentBlock = false;
    for (const line of lines) {
      const l = line.trim();
      if (!l || l.startsWith("#")) continue;
      if (l.toLowerCase().startsWith("user-agent:")) {
        const ua = l.split(":")[1]?.trim().toLowerCase() || "";
        userAgentBlock = ua === "*"; // basic block
      }
      if (!userAgentBlock) continue;
      if (l.toLowerCase().startsWith("disallow:")) {
        disallows.push(l.split(":")[1]?.trim() || "/");
      }
      if (l.toLowerCase().startsWith("allow:")) {
        allows.push(l.split(":")[1]?.trim() || "/");
      }
    }
    // Simple path matching
    const isDisallowed = disallows.some((rule) => rule && path.startsWith(rule.replace(/\*/g, "")));
    const isAllowed = allows.some((rule) => rule && path.startsWith(rule.replace(/\*/g, "")));
    const allowed = isAllowed || !isDisallowed;
    const findings: string[] = [];
    if (isDisallowed && !isAllowed) findings.push(`Path disallowed by robots.txt: ${path}`);
    if (!disallows.length && !allows.length) findings.push("No allow/disallow rules for User-agent: *");
    return { findings, allowed };
  } catch (e) {
    return { findings: ["robots.txt check failed"], allowed: true };
  }
};

const fetchPSI = async (pageUrl: string, device: Device, locale: string) => {
  const key = import.meta.env.PSI_API_KEY || process.env.PSI_API_KEY;
  const params = new URLSearchParams({
    url: pageUrl,
    strategy: device === "desktop" ? "desktop" : "mobile",
    category: "performance",
    locale: locale || "en-AU",
  });
  if (key) params.set("key", String(key));
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`PSI error ${res.status}`);
  return res.json();
};

const extractPSI = (psi: any): { performanceScore: number | null; vitals: CoreWebVitals; mobileFriendly: boolean; issues: IssueItem[] } => {
  const lighthouse = psi?.lighthouseResult;
  const categories = lighthouse?.categories;
  const perf = categories?.performance?.score;
  const audits = lighthouse?.audits || {};
  const LCP = audits["largest-contentful-paint"]?.numericValue || null;
  const CLS = audits["cumulative-layout-shift"]?.numericValue || null;
  const INP = audits["experimental-interaction-to-next-paint"]?.numericValue || audits["interactive"]?.numericValue || null;
  const mobileFriendly = (psi?.analysisUTCTimestamp && true) || true;
  const issues: IssueItem[] = [];
  const opps = lighthouse?.categories?.performance?.auditRefs?.filter((a: any) => a.group === "load-opportunities") || [];
  for (const ref of opps.slice(0, 5)) {
    const a = audits[ref.id];
    if (a) {
      issues.push({ id: ref.id, severity: "info", message: a.title || ref.id, fixHint: a.description || "Review this opportunity in Lighthouse." });
    }
  }
  return { performanceScore: typeof perf === "number" ? Math.round(perf * 100) : null, vitals: { LCP, CLS, INP }, mobileFriendly, issues };
};

const buildIssues = (data: { title: string | null; metaDescription: string | null; h1: string | null; robotsMeta: string | null; indexable: boolean; }) => {
  const issues: IssueItem[] = [];
  const { title, metaDescription, h1, robotsMeta, indexable } = data;
  if (!title) issues.push({ id: "missing-title", severity: "critical", message: "Missing <title> tag", fixHint: "Add a concise, unique <title> around 50–60 characters." });
  if (title && title.length > 65) issues.push({ id: "long-title", severity: "warn", message: "Title may be too long", fixHint: "Keep titles under ~60–65 characters to avoid truncation." });
  if (!metaDescription) issues.push({ id: "missing-meta-desc", severity: "warn", message: "Missing meta description", fixHint: "Add a compelling meta description under ~155–165 chars." });
  if (metaDescription && metaDescription.length > 165) issues.push({ id: "long-meta-desc", severity: "info", message: "Meta description may be too long", fixHint: "Aim for 120–160 characters." });
  if (!h1) issues.push({ id: "missing-h1", severity: "critical", message: "Missing <h1>", fixHint: "Ensure exactly one primary <h1> per page." });
  if (robotsMeta && /noindex/i.test(robotsMeta)) issues.push({ id: "noindex", severity: "critical", message: "robots meta set to noindex", fixHint: "Remove noindex to make the page indexable." });
  if (!indexable) issues.push({ id: "not-indexable", severity: "critical", message: "Page may not be indexable", fixHint: "Check robots.txt, robots meta, HTTP status and canonical." });
  return issues;
};

export const GET: APIRoute = async ({ url: reqUrl }) => {
  const u = new URL(reqUrl);
  const targetUrl = u.searchParams.get("url") || "";
  const device = (u.searchParams.get("device") as Device) || "mobile";
  const locale = u.searchParams.get("locale") || "en-AU";

  if (!targetUrl || !isValidHttpUrl(targetUrl)) {
    return new Response(JSON.stringify({ error: "Invalid URL. Example: https://example.com" }), { status: 400 });
  }

  try {
    // Fetch and parse HTML
    const { html, status, finalUrl } = await fetchHTML(targetUrl);
    const $ = cheerio.load(html);
    const head = parseHead($);

    // robots.txt & indexability
    const robotsCheck = await analyzeRobotsTxt(finalUrl);
    const robotsMeta = head.robotsMeta || null;
    const indexable = !/noindex/i.test(robotsMeta || "") && robotsCheck.allowed && (status || 200) < 400;

    // PSI
    let psiData: any = null;
    let psiExtract = { performanceScore: null as number | null, vitals: {} as CoreWebVitals, mobileFriendly: true, issues: [] as IssueItem[] };
    try {
      psiData = await fetchPSI(finalUrl, device, locale);
      psiExtract = extractPSI(psiData);
    } catch (e) {
      // PSI may fail without API key or quota; continue with page data
      psiExtract = { performanceScore: null, vitals: { LCP: null, CLS: null, INP: null }, mobileFriendly: device === "mobile", issues: [] };
    }

    // Issues
    const contentIssues = buildIssues({ ...head, robotsMeta, indexable });
    const issues: IssueItem[] = [...contentIssues, ...psiExtract.issues];

    const response: SnapshotResponse = {
      title: head.title,
      metaDescription: head.metaDescription,
      h1: head.h1,
      statusCode: status || null,
      canonical: head.canonical,
      robotsMeta,
      robotsTxtFindings: robotsCheck.findings,
      indexable,
      performanceScore: psiExtract.performanceScore,
      coreWebVitals: psiExtract.vitals,
      mobileFriendly: psiExtract.mobileFriendly,
      issues,
      analyzedAt: new Date().toISOString(),
      url: finalUrl,
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "content-type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed to analyze URL" }), { status: 500 });
  }
};
