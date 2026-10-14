import { Box, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SpaLink from "../ui/SpaLink";
import Paragraphs from "../ui/Paragraphs";
import { block, fluid, WIDE } from "../../utils/design";

const ink = "brand.ink";

/** Typography for article HTML coming from the WordPress editor. */
const articleSx = {
  color: ink,
  fontSize: { xs: 16, md: fluid(21, 16) },
  lineHeight: { xs: 1.75, md: 2.05 },
  overflowWrap: "anywhere",
  "& p": { m: 0 },
  "& h2, & h3, & h4": { fontWeight: 700, lineHeight: 1.3, mt: "1.4em", mb: "0.5em" },
  "& ul, & ol": { pl: "1.4em", my: "0.6em" },
  "& a": { color: "primary.main" },
  "& img": { maxWidth: "100%", height: "auto" },
  "& figure": { m: "1.2em 0" },
  "& blockquote": { m: "1em 0", pl: "1em", borderLeft: "3px solid", borderColor: "primary.main" },
};

function PagerLink({ item, basePath, label, direction }) {
  if (!item) return <span />;
  const back = direction === "back";
  const Icon = back ? ArrowBackIcon : ArrowForwardIcon;
  return (
    <SpaLink
      to={`${basePath}/${item.slug}`}
      title={item.title}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: fluid(22, 12),
        color: ink,
        flexDirection: back ? "row" : "row-reverse",
        "&:hover": { color: "primary.main" },
      }}
    >
      <Icon sx={{ fontSize: { xs: 30, md: fluid(40, 28) } }} />
      <Typography component="span" sx={{ fontSize: { xs: 20, md: fluid(27, 18) }, fontWeight: 600, textTransform: "uppercase" }}>
        {label}
      </Typography>
    </SpaLink>
  );
}

/**
 * Shared detail page of a portfolio project and a news post (New
 * Design.pdf): photo, uppercase title, red subtitle, the article and BACK /
 * NEXT links to the neighbouring items, all across the content width.
 */
function DetailLayout({
  image,
  title,
  subtitle,
  html = "",
  text = "",
  children,
  basePath,
  adjacent = {},
  backLabel,
  nextLabel,
}) {
  const hasHtml = html.replace(/<[^>]*>/g, "").trim() !== "";

  return (
    <Box component="article" sx={{ bgcolor: "common.white", pt: { xs: 12, md: fluid(278, 150) }, pb: { xs: 8, md: fluid(88, 60) } }}>
      <Box sx={block(WIDE)}>
        {image && (
          <Box
            component="img"
            src={image}
            alt=""
            // As tall as in the design (753 px at 1920), now across the
            // full content width, so the title stays near the fold.
            sx={{ width: "100%", aspectRatio: { xs: "1217 / 753", md: "1780 / 753" }, objectFit: "cover", display: "block", bgcolor: "#eee" }}
          />
        )}

        <Typography
          component="h1"
          sx={{
            mt: { xs: 4, md: fluid(40, 28) },
            color: ink,
            fontSize: { xs: 30, md: fluid(55, 32) },
            fontWeight: 700,
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: { xs: 1.5, md: fluid(22, 12) }, color: "primary.main", fontSize: { xs: 22, md: fluid(32, 20) }, fontWeight: 600 }}>
            {subtitle}
          </Typography>
        )}

        <Box sx={{ mt: { xs: 3, md: fluid(36, 24) } }}>
          {hasHtml ? (
            <Box sx={articleSx} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <Paragraphs text={text} gap="0" sx={articleSx} />
          )}
        </Box>

        {children && <Box sx={{ mt: { xs: 5, md: fluid(64, 40) } }}>{children}</Box>}

        {(adjacent.back || adjacent.next) && (
          <Box
            component="nav"
            aria-label="More"
            sx={{
              mt: { xs: 7, md: fluid(150, 80) },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <PagerLink item={adjacent.back} basePath={basePath} label={backLabel} direction="back" />
            <PagerLink item={adjacent.next} basePath={basePath} label={nextLabel} direction="next" />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DetailLayout;
