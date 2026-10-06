import axios from "axios";

// ─── CONFIGURATION ─────────────────────────────────────────────────
// In production (WordPress), wpData is injected by wp_localize_script.
// In dev (Vite), requests go through the proxy at /wp-json.
export const WP_JSON_BASE =
  typeof window !== "undefined" && window.wpData?.restUrl
    ? window.wpData.restUrl.replace(/\/?$/, "")
    : "/wp-json";

// Standard WP REST v2 endpoints (/posts, /portfolio, /career, …)
const api = axios.create({
  baseURL: `${WP_JSON_BASE}/wp/v2`,
  timeout: 10000,
});

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Plain text from a WordPress "rendered" string. Titles and term names
 * arrive HTML-encoded ("Design &amp; Build", "Samudra&#8217;s"), so they are
 * decoded rather than shown raw.
 */
export function htmlToText(html) {
  if (!html) return "";
  if (typeof document !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").trim();
  }
  return String(html).replace(/<[^>]+>/g, "").trim();
}

function parseJsonArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** "2025-04-13T09:00:00" → "April 13, 2025" */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function featuredImage(wpPost) {
  return (
    wpPost.featured_image_url ||
    wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    ""
  );
}

/** First embedded term of a taxonomy (from an `_embed`ed response). */
function embeddedTerm(wpPost, taxonomy) {
  for (const group of wpPost._embedded?.["wp:term"] || []) {
    const found = (group || []).find((t) => t.taxonomy === taxonomy);
    if (found) return found;
  }
  return null;
}

/**
 * The neighbours of an item in its list order (newest first): `back` is the
 * item listed just before it (newer), `next` the one just after it (older).
 * Either is null at the ends of the list.
 */
async function fetchAdjacent(type, dateRaw) {
  const one = (params) =>
    api
      .get(`/${type}`, { params: { per_page: 1, orderby: "date", _fields: "slug,title", ...params } })
      .then((res) => {
        const post = res.data[0];
        return post ? { slug: post.slug, title: htmlToText(post.title?.rendered) } : null;
      });
  const [back, next] = await Promise.all([
    one({ after: dateRaw, order: "asc" }),
    one({ before: dateRaw, order: "desc" }),
  ]);
  return { back, next };
}

// ════════════════════════════════════════════════════════════════════
//  PORTFOLIO (Custom Post Type: 'portfolio')
// ════════════════════════════════════════════════════════════════════

/**
 * Maps a WordPress portfolio post to the frontend PortfolioItem shape.
 * This is the single place to update if the WP data structure changes.
 */
function mapWPPortfolio(wpPost) {
  const meta = wpPost.meta || {};
  const term = embeddedTerm(wpPost, "portfolio_category");
  const cover = featuredImage(wpPost);

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    dateRaw: wpPost.date,
    title: htmlToText(wpPost.title?.rendered),
    // Card summary; also the detail text when the editor body is empty.
    description: meta.portfolio_description || "",
    contentHtml: wpPost.content?.rendered || "",
    category: term ? htmlToText(term.name) : "",
    categoryId: term ? term.id : null,
    coverImage: cover || meta.portfolio_hero_image || "",
    heroImage: meta.portfolio_hero_image || cover || "",
    galleryImages: parseJsonArray(meta.portfolio_gallery_images),
  };
}

/**
 * Portfolio categories for the /services filter. `description` is the text
 * shown under the filter while the category is selected.
 */
export async function fetchPortfolioCategories() {
  const res = await api.get("/portfolio_category", {
    params: { per_page: 50, orderby: "name", order: "asc" },
  });
  return res.data.map((term) => ({
    id: term.id,
    slug: term.slug,
    name: htmlToText(term.name),
    description: term.description || "",
  }));
}

/**
 * Fetch all portfolios, optionally limited to one category.
 * @param {number|null} [categoryId] - portfolio_category term id (omit for all)
 */
export async function fetchPortfolioItems(categoryId) {
  const params = {
    _embed: true,
    per_page: 100,
    orderby: "date",
    order: "desc",
  };
  if (categoryId) params.portfolio_category = categoryId;

  const res = await api.get("/portfolio", { params });
  return res.data.map(mapWPPortfolio);
}

/** Fetch a single portfolio by slug (null when it does not exist). */
export async function fetchPortfolioBySlug(slug) {
  const res = await api.get("/portfolio", {
    params: { slug, _embed: true },
  });
  if (res.data.length === 0) return null;
  return mapWPPortfolio(res.data[0]);
}

/** BACK / NEXT links of a portfolio detail page. */
export function fetchAdjacentPortfolios(item) {
  return fetchAdjacent("portfolio", item.dateRaw);
}

// ════════════════════════════════════════════════════════════════════
//  EVENTS / NEWS (Default WordPress 'post' type)
// ════════════════════════════════════════════════════════════════════

/** Maps a WordPress post to the frontend EventItem shape. */
function mapWPEvent(wpPost) {
  return {
    id: wpPost.id,
    slug: wpPost.slug,
    dateRaw: wpPost.date,
    title: htmlToText(wpPost.title?.rendered),
    date: formatDate(wpPost.date),
    description: htmlToText(wpPost.excerpt?.rendered),
    contentHtml: wpPost.content?.rendered || "",
    coverImage: featuredImage(wpPost),
  };
}

/** Fetch all event/news posts, newest first. */
export async function fetchEventItems() {
  const res = await api.get("/posts", {
    params: {
      _embed: true,
      per_page: 100,
      orderby: "date",
      order: "desc",
    },
  });
  return res.data.map(mapWPEvent);
}

/** Fetch a single event/news post by slug (null when it does not exist). */
export async function fetchEventBySlug(slug) {
  const res = await api.get("/posts", {
    params: { slug, _embed: true },
  });
  if (res.data.length === 0) return null;
  return mapWPEvent(res.data[0]);
}

/** BACK / NEXT links of a news detail page. */
export function fetchAdjacentEvents(item) {
  return fetchAdjacent("posts", item.dateRaw);
}

/** Fetch the latest N news/event posts (Home page strip). */
export async function fetchLatestNews(limit = 6) {
  const res = await api.get("/posts", {
    params: {
      _embed: true,
      per_page: limit,
      orderby: "date",
      order: "desc",
    },
  });
  return res.data.map(mapWPEvent);
}

// ════════════════════════════════════════════════════════════════════
//  CAREER POSITIONS (Custom Post Type: 'career')
// ════════════════════════════════════════════════════════════════════

/** Today as "YYYY-MM-DD" in the visitor's time zone. */
function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mapWPCareer(wpPost) {
  const meta = wpPost.meta || {};
  const closingDate = meta.career_closing_date || "";
  return {
    id: wpPost.id,
    title: htmlToText(wpPost.title?.rendered),
    image: featuredImage(wpPost),
    type: meta.career_type || "",
    level: meta.career_level || "",
    location: meta.career_location || "",
    description: meta.career_description || "",
    closingDate,
    // "2026-10-30" → "30 October 2026", as in the design.
    closingDateLabel: closingDate
      ? new Date(`${closingDate}T00:00:00`).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
  };
}

/**
 * Open positions: published, and either without a closing date or closing
 * today or later. The application form offers exactly these.
 */
export async function fetchCareerPositions() {
  const res = await api.get("/career", {
    params: {
      _embed: true,
      per_page: 50,
      orderby: "date",
      order: "desc",
    },
  });
  const today = todayIso();
  return res.data
    .map(mapWPCareer)
    .filter((job) => !job.closingDate || job.closingDate >= today);
}

// ════════════════════════════════════════════════════════════════════
//  SEARCH (navbar)
// ════════════════════════════════════════════════════════════════════

/**
 * News posts and portfolios matching a query. Permalinks already point at
 * the React routes (/events/<slug>, /services/<slug>), so only the path is
 * kept.
 */
export async function searchSite(query, { signal } = {}) {
  const res = await api.get("/search", {
    params: {
      search: query,
      type: "post",
      subtype: "post,portfolio",
      per_page: 20,
    },
    signal,
  });
  return res.data.map((hit) => {
    let path = "";
    try {
      path = new URL(hit.url).pathname;
    } catch {
      path = "";
    }
    return {
      id: hit.id,
      title: htmlToText(hit.title),
      kind: hit.subtype === "portfolio" ? "project" : "news",
      path,
    };
  });
}

// ════════════════════════════════════════════════════════════════════
//  FORMS (Request a Proposal, Career Application)
// ════════════════════════════════════════════════════════════════════

/**
 * POST a multipart form to /samudra/v1/forms/<kind>. Resolves on success;
 * rejects with an Error whose `fields` maps field names to the server's
 * validation messages.
 */
export async function submitForm(kind, formData) {
  try {
    const res = await axios.post(`${WP_JSON_BASE}/samudra/v1/forms/${kind}`, formData, {
      timeout: 120000,
    });
    return res.data;
  } catch (err) {
    const data = err.response?.data;
    // An empty message means "no usable answer from the server" (network
    // error, PHP fatal): the form then shows its own generic error text.
    const error = new Error(data?.message || "");
    error.fields = data?.data?.fields || {};
    throw error;
  }
}
