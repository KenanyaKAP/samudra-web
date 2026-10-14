import { Box, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useSection } from "../../hooks/useSiteData";
import { EDGE, fluid } from "../../utils/design";

/** "+62 812-3456 7890" → "6281234567890" (the format wa.me expects). */
function waNumber(number) {
  return String(number || "").replace(/\D/g, "");
}

/**
 * Floating "Tell us about your project / Chat with Samudra" pill, bottom
 * right on every page: in line with the right edge of the content, 50 px
 * from the bottom at 1920.
 * Hidden until Site Content → Global → Whatsapp → Number is filled in. On
 * phones only the round icon shows, so it never covers the content.
 */
function WhatsAppButton() {
  const { whatsapp = {} } = useSection("global");
  const number = waNumber(whatsapp.number);
  if (!number) return null;

  const href = `https://wa.me/${number}${whatsapp.message ? `?text=${encodeURIComponent(whatsapp.message)}` : ""}`;

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${whatsapp.title || "WhatsApp"} — ${whatsapp.subtitle || ""}`}
      sx={{
        position: "fixed",
        right: EDGE,
        bottom: { xs: 16, md: fluid(50, 20) },
        zIndex: (t) => t.zIndex.appBar - 2,
        display: "flex",
        alignItems: "center",
        gap: fluid(20, 12),
        p: { xs: "6px", md: `${fluid(9, 6)} ${fluid(32, 16)} ${fluid(9, 6)} ${fluid(10, 6)}` },
        borderRadius: 999,
        bgcolor: "rgba(20, 18, 17, 0.72)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(6px)",
        color: "common.white",
        textDecoration: "none",
        transition: "transform .2s ease, background-color .2s ease",
        "&:hover": { transform: "translateY(-2px)", bgcolor: "rgba(20, 18, 17, 0.88)" },
      }}
    >
      <Box
        sx={{
          width: { xs: 52, md: fluid(60, 48) },
          height: { xs: 52, md: fluid(60, 48) },
          borderRadius: "50%",
          bgcolor: "#3A3838",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <WhatsAppIcon sx={{ color: "#4DBE48", fontSize: { xs: 32, md: fluid(36, 28) } }} />
      </Box>
      <Box sx={{ display: { xs: "none", md: "block" }, lineHeight: 1.3 }}>
        <Typography sx={{ fontSize: fluid(16, 13), fontWeight: 600, lineHeight: 1.4 }}>{whatsapp.title}</Typography>
        <Typography sx={{ fontSize: fluid(16, 13), fontWeight: 300, lineHeight: 1.4 }}>{whatsapp.subtitle}</Typography>
      </Box>
    </Box>
  );
}

export default WhatsAppButton;
