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
    title: htmlToText(wpPost.title?.rendered),
    description: meta.portfolio_description || "",
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

/**
 * Related projects for the detail page: same category, excluding the
 * current one.
 */
export async function fetchHighlightedProjects(categoryId, excludeId, limit = 6) {
  const params = {
    _embed: true,
    per_page: limit,
    exclude: excludeId,
    orderby: "date",
    order: "desc",
  };
  if (categoryId) params.portfolio_category = categoryId;

  const res = await api.get("/portfolio", { params });
  return res.data.map(mapWPPortfolio).slice(0, limit);
}

// ════════════════════════════════════════════════════════════════════
//  EVENTS / NEWS (Default WordPress 'post' type)
// ════════════════════════════════════════════════════════════════════

/** Maps a WordPress post to the frontend EventItem shape. */
function mapWPEvent(wpPost) {
  const term = embeddedTerm(wpPost, "category");
  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title: htmlToText(wpPost.title?.rendered),
    date: formatDate(wpPost.date),
    description: htmlToText(wpPost.excerpt?.rendered),
    content: htmlToText(wpPost.content?.rendered),
    contentHtml: wpPost.content?.rendered || "",
    coverImage: featuredImage(wpPost),
    category: term ? htmlToText(term.name) : "",
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

/** Fetch more/related events, excluding the current one. */
export async function fetchMoreEvents(excludeId, limit = 3) {
  const res = await api.get("/posts", {
    params: {
      _embed: true,
      per_page: limit,
      exclude: excludeId,
      orderby: "date",
      order: "desc",
    },
  });
  return res.data.map(mapWPEvent);
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

function mapWPCareer(wpPost) {
  const meta = wpPost.meta || {};
  return {
    id: wpPost.id,
    title: htmlToText(wpPost.title?.rendered),
    type: meta.career_type || "Full Time",
    location: meta.career_location || "",
    description: meta.career_description || "",
    applyUrl: meta.career_apply_url || "",
  };
}

/** Fetch all open career positions. */
export async function fetchCareerPositions() {
  const res = await api.get("/career", {
    params: {
      per_page: 50,
      orderby: "date",
      order: "desc",
    },
  });
  return res.data.map(mapWPCareer);
}
