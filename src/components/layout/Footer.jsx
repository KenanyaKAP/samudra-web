import { Box, Typography, Link as MuiLink, SvgIcon } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useSection } from "../../hooks/useSiteData";
import OfficeBlock from "../ui/OfficeBlock";
import { block, fluid, WIDE } from "../../utils/design";

/** The plain "f" of the design (MUI's Facebook icon is the round badge). */
function FacebookIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M14.2 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H8v3.2h2.8V22h3.4z" />
    </SvgIcon>
  );
}

// Site Content → Global → Footer → Socials → Platform
const SOCIAL_ICONS = {
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};

const labelSx = {
  fontSize: fluid(28, 20),
  fontWeight: 700,
  textTransform: "uppercase",
  color: "common.white",
  lineHeight: 1.2,
};

/**
 * Site footer (the client's footer.pdf, Oct 2026): headquarter on the left,
 * the branch offices in two columns on the right, one rule across both, then
 * the Samudra mark with the copyright under it, and the social links.
 */
function Footer() {
  const { offices = {}, footer = {} } = useSection("global");
  const branches = offices.branches || [];
  const socials = (footer.socials || []).filter((s) => SOCIAL_ICONS[s.platform] && s.url);

  return (
    <Box component="footer" sx={{ bgcolor: "brand.charcoal", color: "common.white" }}>
      <Box sx={{ ...block(WIDE), pt: { xs: 7, lg: fluid(90, 48) }, pb: { xs: 5, lg: fluid(35, 24) } }}>
        {/* Labels + one rule across both columns */}
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "901fr 879fr",
            pb: fluid(26, 16),
            borderBottom: "1px solid rgba(255,255,255,0.85)",
          }}
        >
          <Typography component="h2" sx={labelSx}>
            {footer.headquarterLabel}
          </Typography>
          <Typography component="h2" sx={labelSx}>
            {footer.branchLabel}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "901fr 879fr" },
            rowGap: 5,
            mt: { xs: 0, md: fluid(36, 24) },
          }}
        >
          <Box>
            <Typography
              component="h2"
              sx={{ ...labelSx, display: { md: "none" }, pb: 2, mb: 3, borderBottom: "1px solid rgba(255,255,255,0.85)" }}
            >
              {footer.headquarterLabel}
            </Typography>
            <OfficeBlock office={offices.headquarter} loose />
          </Box>

          <Box>
            <Typography
              component="h2"
              sx={{ ...labelSx, display: { md: "none" }, pb: 2, mb: 3, borderBottom: "1px solid rgba(255,255,255,0.85)" }}
            >
              {footer.branchLabel}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "426fr 453fr" },
                columnGap: 3,
                rowGap: { xs: 4, md: fluid(67, 32) },
              }}
            >
              {branches.map((office, i) => (
                <OfficeBlock key={(office.city || "") + i} office={office} />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Logo + copyright | Connect with us */}
        <Box
          sx={{
            mt: { xs: 7, lg: fluid(17, 10) },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "flex-end" },
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          {/* The padding sets "Connect with us" a little lower than the
              copyright, as in the design. */}
          <Box sx={{ pb: { md: fluid(13, 6) } }}>
            {footer.logo && (
              <Box
                component="img"
                src={footer.logo}
                alt="Samudra"
                sx={{ width: { xs: 96, md: fluid(134, 96) }, height: "auto", display: "block" }}
              />
            )}
            {/* As small as in the design on desktop; readable on phones
                and tablets. */}
            <Typography sx={{ mt: { xs: 2, lg: fluid(28, 14) }, fontSize: { xs: 11, lg: fluid(9.5, 9) } }}>
              {footer.copyright}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: fluid(34, 20) }}>
            <Typography sx={{ fontSize: fluid(26, 18), fontWeight: 600, textTransform: "uppercase" }}>
              {footer.connectLabel}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: fluid(16, 10) }}>
              {socials.map((social, i) => {
                const Icon = SOCIAL_ICONS[social.platform];
                return (
                  <MuiLink
                    key={social.platform + i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    sx={{ color: "common.white", display: "flex", "&:hover": { color: "primary.main" } }}
                  >
                    <Icon sx={{ fontSize: fluid(40, 28) }} />
                  </MuiLink>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
