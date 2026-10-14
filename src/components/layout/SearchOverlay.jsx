import { useEffect, useState } from "react";
import { Box, ButtonBase, CircularProgress, Dialog, IconButton, InputBase, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigation } from "../../hooks/useNavigation";
import { useSection } from "../../hooks/useSiteData";
import { searchSite } from "../../services/wpApi";
import { block, fluid, WIDE } from "../../utils/design";

const MIN_LENGTH = 2;

/**
 * Full-screen search over News posts and Portfolios (WordPress
 * /wp/v2/search). Not in the PDF, so it borrows the dark form styling of the
 * Request a Proposal page.
 */
function SearchOverlay({ open, onClose }) {
  const { navigateWithFade } = useNavigation();
  const { search: labels = {} } = useSection("global");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  // Start fresh every time the overlay opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setStatus("idle");
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_LENGTH) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    const timer = setTimeout(() => {
      searchSite(q, { signal: controller.signal })
        .then((hits) => {
          setResults(hits.filter((h) => h.path));
          setStatus("done");
        })
        .catch((err) => {
          if (err?.name !== "CanceledError") setStatus("error");
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const groups = [
    { kind: "news", label: labels.newsLabel },
    { kind: "project", label: labels.projectsLabel },
  ]
    .map((g) => ({ ...g, items: results.filter((r) => r.kind === g.kind) }))
    .filter((g) => g.items.length);

  const openResult = (path) => {
    onClose();
    navigateWithFade(path);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: { sx: { bgcolor: "rgba(17, 15, 13, 0.97)", backgroundImage: "none" } },
      }}
    >
      <Box sx={{ ...block(WIDE), pt: { xs: 3, lg: fluid(47, 24) }, pb: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={onClose} aria-label="Close search" sx={{ color: "common.white" }}>
            <CloseIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>

        <Box
          component="form"
          role="search"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            mt: { xs: 2, md: 6 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "2px solid",
            borderColor: "primary.main",
            pb: 1.5,
          }}
        >
          <SearchIcon sx={{ color: "common.white", fontSize: { xs: 28, md: 40 } }} />
          <InputBase
            // Focus on mount, not after the open transition, so typing
            // straight after the click loses no characters.
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            inputProps={{ "aria-label": labels.placeholder || "Search" }}
            sx={{
              flex: 1,
              color: "common.white",
              fontSize: { xs: 22, md: fluid(40, 26) },
              fontWeight: 600,
              "& input::placeholder": { color: "brand.placeholder", opacity: 1 },
            }}
          />
          {status === "loading" && <CircularProgress size={24} sx={{ color: "common.white" }} />}
        </Box>

        <Box sx={{ mt: { xs: 4, md: 6 } }} aria-live="polite">
          {status === "done" && !groups.length && (
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>{labels.emptyText}</Typography>
          )}

          {groups.map((group) => (
            <Box key={group.kind} sx={{ mb: 5 }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: 14,
                  mb: 1,
                }}
              >
                {group.label}
              </Typography>
              {group.items.map((hit) => (
                <ButtonBase
                  key={hit.kind + hit.id}
                  onClick={() => openResult(hit.path)}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    gap: 2,
                    py: 2,
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                    color: "common.white",
                    textAlign: "left",
                    "&:hover, &:focus-visible": { color: "primary.main" },
                  }}
                >
                  <Typography sx={{ fontSize: { xs: 17, md: 21 }, fontWeight: 600 }}>{hit.title}</Typography>
                  <ArrowForwardIcon />
                </ButtonBase>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Dialog>
  );
}

export default SearchOverlay;
