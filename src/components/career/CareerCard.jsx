import { Box, ButtonBase, Typography } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { block, fluid } from "../../utils/design";

function Meta({ icon, children, first }) {
  const Icon = icon;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: fluid(10, 6),
        pl: first ? 0 : { xs: 0, md: fluid(22, 12) },
        pr: { xs: 0, md: fluid(22, 12) },
        borderLeft: { md: first ? "none" : "1px solid rgba(255,255,255,0.75)" },
      }}
    >
      <Icon sx={{ fontSize: { xs: 22, md: fluid(34, 22) } }} />
      <Typography component="span" sx={{ fontSize: { xs: 16, md: fluid(21, 15) }, fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

/**
 * Open position (New Design.pdf, Career): photo, title, location | type |
 * level, short description, closing date and an APPLY button that jumps to
 * the application form with this position selected.
 */
function CareerCard({ job, applyLabel, closesLabel, onApply }) {
  return (
    <Box
      component="article"
      sx={{
        ...block(1532),
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 3, md: fluid(60, 28) },
        p: { xs: 2.5, md: `${fluid(29, 20)} ${fluid(60, 28)}` },
        border: "1px solid rgba(255,255,255,0.55)",
        borderRadius: { xs: "18px", md: fluid(30, 18) },
        bgcolor: "rgba(12, 10, 9, 0.62)",
        color: "common.white",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: "100%", md: fluid(331, 220) },
          aspectRatio: "1",
          borderRadius: { xs: "14px", md: fluid(22, 14) },
          overflow: "hidden",
          bgcolor: "#2b2b2b",
        }}
      >
        {job.image && <Box component="img" src={job.image} alt="" loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Typography component="h3" sx={{ fontSize: { xs: 24, md: fluid(35, 22) }, fontWeight: 600, mt: { md: fluid(12, 4) } }}>
          {job.title}
        </Typography>

        <Box sx={{ mt: { xs: 2, md: fluid(38, 16) }, display: "flex", flexWrap: "wrap", rowGap: 1, columnGap: { xs: 2.5, md: 0 } }}>
          {[
            [LocationOnOutlinedIcon, job.location],
            [WorkOutlineIcon, job.type],
            [GroupsOutlinedIcon, job.level],
          ]
            .filter(([, text]) => text)
            .map(([icon, text], i) => (
              <Meta key={text} icon={icon} first={i === 0}>
                {text}
              </Meta>
            ))}
        </Box>

        {job.description && (
          <Typography sx={{ mt: { xs: 1.5, md: fluid(12, 8) }, fontSize: { xs: 15, md: fluid(17, 14) }, lineHeight: 1.25, whiteSpace: "pre-line" }}>
            {job.description}
          </Typography>
        )}

        <Box sx={{ mt: "auto", pt: { xs: 3, md: fluid(40, 20) } }}>
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.75)",
              pt: { xs: 2, md: fluid(28, 16) },
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: fluid(14, 8) }}>
              {job.closingDateLabel && (
                <>
                  <EventOutlinedIcon sx={{ fontSize: { xs: 24, md: fluid(36, 24) } }} />
                  <Typography sx={{ fontSize: { xs: 15, md: fluid(20, 14) } }}>
                    {closesLabel}{" "}
                    <Box component="strong" sx={{ fontWeight: 700 }}>
                      {job.closingDateLabel}
                    </Box>
                  </Typography>
                </>
              )}
            </Box>
            <ButtonBase
              onClick={() => onApply(job)}
              sx={{
                width: { xs: "100%", sm: fluid(230, 180) },
                height: { xs: 50, md: fluid(59, 46) },
                gap: fluid(26, 14),
                bgcolor: "#ED1C24",
                color: "common.white",
                borderRadius: fluid(10, 8),
                fontSize: { xs: 20, md: fluid(26, 18) },
                fontWeight: 600,
                textTransform: "uppercase",
                "&:hover": { filter: "brightness(1.08)" },
              }}
            >
              {applyLabel}
              <ArrowForwardIcon sx={{ fontSize: { xs: 26, md: fluid(38, 24) } }} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CareerCard;
