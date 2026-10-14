import { useCallback, useEffect, useState } from "react";
import { Box, ButtonBase } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import NewsCard from "../ui/NewsCard";
import Chevron from "../ui/Chevron";
import { block, EDGE, fluid, WIDE } from "../../utils/design";

const GAP = fluid(36, 16);

/**
 * Home news strip: three cards across the content width (one and a bit on
 * phones), with the thin side chevrons of the hero centred in the side
 * margins. Draggable.
 */
function NewsCarousel({ items = [], buttonLabel }) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback((api) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!embla) return;
    sync(embla);
    embla.on("select", sync).on("reInit", sync);
    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla, sync]);

  const arrows = [
    { dir: "left", label: "Previous news", enabled: canPrev, onClick: () => embla?.scrollPrev(), side: { left: 0 } },
    { dir: "right", label: "Next news", enabled: canNext, onClick: () => embla?.scrollNext(), side: { right: 0 } },
  ];

  return (
    <Box sx={{ position: "relative" }}>
      <Box ref={emblaRef} sx={{ ...block(WIDE), overflow: "hidden" }}>
        <Box sx={{ display: "flex", gap: GAP }}>
          {items.map((news) => (
            <Box
              key={news.id}
              sx={{
                flex: {
                  xs: "0 0 86%",
                  sm: `0 0 calc((100% - ${GAP}) / 2)`,
                  md: `0 0 calc((100% - 2 * ${GAP}) / 3)`,
                },
                minWidth: 0,
              }}
            >
              <NewsCard
                to={`/events/${news.slug}`}
                image={news.coverImage}
                date={news.date}
                title={news.title}
                description={news.description}
                buttonLabel={buttonLabel}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {arrows.map((a) => (
        <ButtonBase
          key={a.dir}
          onClick={a.onClick}
          disabled={!a.enabled}
          aria-label={a.label}
          sx={{
            display: { xs: "none", md: "flex" },
            position: "absolute",
            top: "38%",
            transform: "translateY(-50%)",
            ...a.side,
            width: { md: EDGE.md, lg: EDGE.lg },
            py: 1,
            color: "rgba(255,255,255,0.85)",
            "&:hover": { color: "common.white" },
            "&.Mui-disabled": { opacity: 0.3 },
          }}
        >
          <Chevron direction={a.dir} size={fluid(70, 46)} strokeWidth={3} />
        </ButtonBase>
      ))}
    </Box>
  );
}

export default NewsCarousel;
