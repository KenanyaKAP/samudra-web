import { useEffect, useState } from "react";
import { Box, ButtonBase, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Chevron from "../ui/Chevron";
import { fluid } from "../../utils/design";

/**
 * Project photos under the text of a portfolio: a grid of thumbnails that
 * open full size in a lightbox (arrow keys / buttons to move between them).
 */
function GalleryGrid({ images = [], title = "" }) {
  const [open, setOpen] = useState(null); // index or null
  const count = images.length;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  if (!count) return null;

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: { xs: 1, md: fluid(16, 10) },
        }}
      >
        {images.map((src, i) => (
          <ButtonBase
            key={src + i}
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${count}`}
            sx={{ aspectRatio: "4 / 3", overflow: "hidden", bgcolor: "#e6e6e6", "&:hover img": { transform: "scale(1.04)" } }}
          >
            <Box
              component="img"
              src={src}
              alt=""
              loading="lazy"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s ease" }}
            />
          </ButtonBase>
        ))}
      </Box>

      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        fullScreen
        slotProps={{ paper: { sx: { bgcolor: "rgba(0,0,0,0.94)", backgroundImage: "none" } } }}
      >
        {open !== null && (
          <Box sx={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 10 } }}>
            <Box
              component="img"
              src={images[open]}
              alt={`${title} — photo ${open + 1} of ${count}`}
              sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
            />
            <IconButton
              onClick={() => setOpen(null)}
              aria-label="Close"
              sx={{ position: "absolute", top: 16, right: 16, color: "common.white" }}
            >
              <CloseIcon sx={{ fontSize: 34 }} />
            </IconButton>
            <Typography sx={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
              {open + 1} / {count}
            </Typography>
            {count > 1 &&
              [
                { dir: "left", label: "Previous photo", side: { left: { xs: 4, md: 24 } }, to: (open - 1 + count) % count },
                { dir: "right", label: "Next photo", side: { right: { xs: 4, md: 24 } }, to: (open + 1) % count },
              ].map((a) => (
                <ButtonBase
                  key={a.dir}
                  onClick={() => setOpen(a.to)}
                  aria-label={a.label}
                  sx={{ position: "absolute", top: "50%", transform: "translateY(-50%)", ...a.side, p: 1.5, color: "common.white" }}
                >
                  <Chevron direction={a.dir} size={{ xs: 36, md: 56 }} strokeWidth={3} />
                </ButtonBase>
              ))}
          </Box>
        )}
      </Dialog>
    </>
  );
}

export default GalleryGrid;
