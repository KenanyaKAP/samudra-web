import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchAdjacentEvents, fetchEventBySlug } from "../services/wpApi";
import { useSection } from "../hooks/useSiteData";
import DetailLayout from "../components/detail/DetailLayout";
import NotFound from "./NotFound";

/**
 * /events/:slug — one News post: cover image, title, publication date in
 * red, the article, and BACK / NEXT to the neighbouring posts.
 */
export default function EventDetail() {
  const { slug } = useParams();
  const { backLabel, nextLabel } = useSection("news");
  const [state, setState] = useState({ loading: true, item: null });
  const [adjacent, setAdjacent] = useState({});

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, item: null });
    setAdjacent({});
    fetchEventBySlug(slug)
      .then((item) => {
        if (cancelled) return;
        setState({ loading: false, item });
        if (item) {
          document.title = `${item.title} - Samudra`;
          fetchAdjacentEvents(item)
            .then((links) => !cancelled && setAdjacent(links))
            .catch(() => {});
        }
      })
      .catch(() => !cancelled && setState({ loading: false, item: null }));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.loading) return <Box sx={{ minHeight: "100vh", bgcolor: "common.white" }} />;
  if (!state.item) return <NotFound />;

  const item = state.item;
  return (
    <DetailLayout
      image={item.coverImage}
      title={item.title}
      subtitle={item.date}
      html={item.contentHtml}
      text={item.description}
      basePath="/events"
      adjacent={adjacent}
      backLabel={backLabel}
      nextLabel={nextLabel}
    />
  );
}
