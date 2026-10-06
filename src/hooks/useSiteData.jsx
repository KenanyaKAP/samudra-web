import { createContext, useContext, useEffect, useState } from "react";
import { WP_JSON_BASE } from "../services/wpApi";

// Seeds — also the fallback when WordPress is unreachable, so the site
// never renders blank.
import seedGlobal from "../data/global.json";
import seedHome from "../data/home.json";
import seedAbout from "../data/about.json";
import seedPeople from "../data/people.json";
import seedServices from "../data/services.json";
import seedNews from "../data/news.json";
import seedContact from "../data/contact.json";
import seedCareer from "../data/career.json";
import seedPrivacyPolicy from "../data/privacyPolicy.json";
import seedNotFound from "../data/notFound.json";

const defaultData = {
  global: seedGlobal,
  home: seedHome,
  about: seedAbout,
  people: seedPeople,
  services: seedServices,
  news: seedNews,
  contact: seedContact,
  career: seedCareer,
  privacyPolicy: seedPrivacyPolicy,
  notFound: seedNotFound,
};

const SiteDataContext = createContext(defaultData);

/**
 * Options round-trip through WordPress as associative arrays, so a list whose
 * rows were added/removed in wp-admin can come back keyed by "0", "2",
 * "new_1699…". Rebuild those as real arrays or every .map() downstream breaks.
 */
function sanitizeData(val) {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sanitizeData);
  if (typeof val === "object") {
    const originalKeys = Object.keys(val);
    const keys = originalKeys.filter((k) => k !== "__INDEX__");

    const isNumericList =
      originalKeys.length > 0 &&
      originalKeys.every(
        (k) => /^\d+$/.test(k) || k.startsWith("new_") || k === "__INDEX__",
      );

    const cleaned = {};
    keys.forEach((k) => {
      cleaned[k] = sanitizeData(val[k]);
    });

    return isNumericList ? Object.values(cleaned) : cleaned;
  }
  return val;
}

/**
 * Merge fetched content over the bundled seeds so a section the editor has not
 * filled in yet keeps its default copy instead of rendering empty.
 */
function deepMerge(target, source) {
  if (source === null || source === undefined) return target;
  if (Array.isArray(source)) {
    // Lists are authoritative: the editor may have removed rows on purpose.
    return source.map((item, idx) =>
      target && target[idx] ? deepMerge(target[idx], item) : item,
    );
  }
  if (typeof source === "object") {
    // PHP encodes an emptied list as [] but an empty object the same way, so
    // an object arriving where the seed has a list means "no rows".
    if (Array.isArray(target)) return Object.keys(source).length ? target : [];
    const merged = { ...target };
    Object.keys(source).forEach((key) => {
      if (key === "__INDEX__") return;
      if (source[key] === undefined) return;
      if (
        target &&
        typeof target[key] === "object" &&
        target[key] !== null &&
        typeof source[key] === "object" &&
        source[key] !== null
      ) {
        merged[key] = deepMerge(target[key], source[key]);
      } else if (Array.isArray(target?.[key]) && source[key] === "") {
        // A list emptied in wp-admin may come back as "" — keep it a list.
        merged[key] = [];
      } else {
        merged[key] = source[key];
      }
    });
    return merged;
  }
  return source;
}

export function SiteDataProvider({ children }) {
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await fetch(`${WP_JSON_BASE}/samudra/v1/data`);
        if (!response.ok) return;
        const json = await response.json();
        if (cancelled) return;
        if (json && typeof json === "object" && !Array.isArray(json)) {
          const sanitized = sanitizeData(json);
          setData((prev) => deepMerge(prev, sanitized));
        } else {
          console.warn("Unexpected site data payload from WordPress:", json);
        }
      } catch (err) {
        console.warn(
          "Could not reach WordPress; rendering bundled seed content instead.",
          err,
        );
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}

/** Convenience accessor for a single section. */
export function useSection(key) {
  const data = useSiteData();
  return data?.[key] ?? {};
}
