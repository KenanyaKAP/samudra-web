import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchAdjacentPortfolios, fetchPortfolioBySlug } from "../services/wpApi";
import { useSection } from "../hooks/useSiteData";
import DetailLayout from "../components/detail/DetailLayout";
import GalleryGrid from "../components/detail/GalleryGrid";
import NotFound from "./NotFound";

/**
 * /services/:slug — one portfolio project (wp-admin → Portfolios): main
 * image, title, category, the editor text (or the card summary), the
 * gallery, and BACK / NEXT to the neighbouring projects.
 */
export default function PortfolioDetail() {
  const { slug } = useParams();
  const { backLabel, nextLabel } = useSection("services");
  const [state, setState] = useState({ loading: true, item: null });
  const [adjacent, setAdjacent] = useState({});

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, item: null });
    setAdjacent({});
    fetchPortfolioBySlug(slug)
      .then((item) => {
        if (cancelled) return;
        setState({ loading: false, item });
        if (item) {
          document.title = `${item.title} - Samudra`;
          fetchAdjacentPortfolios(item)
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
      image={item.heroImage}
      title={item.title}
      subtitle={item.category}
      html={item.contentHtml}
      text={item.description}
      basePath="/services"
      adjacent={adjacent}
      backLabel={backLabel}
      nextLabel={nextLabel}
    >
      {item.galleryImages.length > 0 && <GalleryGrid images={item.galleryImages} title={item.title} />}
    </DetailLayout>
  );
}
