import { Box, Typography } from "@mui/material";
import SpaLink from "./SpaLink";
import RedBar from "./RedBar";
import { fluid } from "../../utils/design";

const BODY = {
  // Home: translucent black over the red section background.
  onRed: "rgba(0, 0, 0, 0.74)",
  // Services page: solid grey on white.
  grey: "brand.card",
};

/**
 * Service / portfolio card (New Design.pdf, Home "Service" and the Services
 * grid): photo, title, short text and a red "MORE →" strip. The photo is
 * black-and-white until hovered; on touch screens it is always in colour.
 */
function ServiceCard({ to, image, title, description, buttonLabel, variant = "grey" }) {
  return (
    <SpaLink
      to={to}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "common.white",
        "@media (hover: hover)": {
          "& img": { filter: "grayscale(1)" },
          "&:hover img, &:focus-visible img": { filter: "grayscale(0)" },
        },
      }}
    >
      <Box sx={{ aspectRatio: "420 / 376", bgcolor: "#2b2b2b", overflow: "hidden", flexShrink: 0 }}>
        {image && (
          <Box
            component="img"
            src={image}
            alt=""
            loading="lazy"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "filter .35s ease" }}
          />
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: fluid(196, 150),
          bgcolor: BODY[variant] || BODY.grey,
          px: fluid(21, 16),
          pt: fluid(38, 22),
          pb: fluid(24, 16),
        }}
      >
        <Typography
          component="h3"
          sx={{ fontSize: fluid(20, 16), fontWeight: 700, textTransform: "uppercase", lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              mt: fluid(14, 10),
              fontSize: fluid(13, 13),
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      <RedBar label={buttonLabel} height={38} fontSize={17} />
    </SpaLink>
  );
}

export default ServiceCard;
