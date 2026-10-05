import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { YouTube } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useSection } from "../../hooks/useSiteData";
import OfficeBlock from "../ui/OfficeBlock";
import { pairs } from "../../utils/offices";

// Site Content → Global → Footer → Socials → Platform
const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTube,
  linkedin: LinkedInIcon,
};

function Divider({ mb }) {
  return (
    <Box
      mt={2}
      mb={mb}
      sx={{
        width: "100%",
        height: "1px",
        bgcolor: "white",
        borderRadius: "2px",
      }}
    />
  );
}

function Footer() {
  const location = useLocation();
  const { logo, offices = {}, footer = {} } = useSection("global");
  const branches = offices.branches || [];
  const socialLinks = (footer.socials || []).filter(
    (social) => SOCIAL_ICONS[social.platform],
  );

  return (
    <Box component="footer" bgcolor={"#373737"}>
      {/* Top section - dark */}
      <Container
        maxWidth={"xxl"}
        sx={{
          py: 6,
        }}
      >
        {location.pathname !== "/contact" && (
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={4}
            mb={6}
          >
            <Box flex={1}>
              <Typography
                variant="headingSmall"
                color="text.light"
                fontWeight={700}
              >
                {footer.headquarterLabel}
              </Typography>

              {/* Horizontal line */}
              <Divider mb={3} />

              <Box>
                <OfficeBlock office={offices.headquarter} />
              </Box>
            </Box>

            <Box flex={1.3}>
              <Typography
                variant="headingSmall"
                color="text.light"
                fontWeight={700}
              >
                {footer.branchLabel}
              </Typography>

              {/* Horizontal line */}
              <Divider mb={4} />

              {pairs(branches).map((row, rowIndex) => (
                <Box
                  key={rowIndex}
                  display={"flex"}
                  gap={4}
                  mt={rowIndex > 0 ? 4 : undefined}
                  flexDirection={{
                    xs: "column",
                    sm: "row",
                  }}
                >
                  {row.map((office, i) => (
                    <Box flex={1} key={(office.city || "") + i}>
                      <OfficeBlock office={office} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box
          display={"flex"}
          flexDirection={{
            xs: "column-reverse",
            sm: "row",
          }}
          alignItems={{
            xs: "start",
            sm: "end",
          }}
          gap={6}
        >
          <Box flex={1}>
            <Box
              component={"img"}
              src={logo}
              alt="Logo"
              sx={{
                width: "80%",
                maxWidth: "400px",
                height: "auto",
                mb: 2,
              }}
            />
            <Typography
              variant="bodySmall"
              color="text.light"
              display={"block"}
            >
              {footer.copyright}
            </Typography>
          </Box>
          <Box
            flex={1.3}
            display={"flex"}
            flexGrow={1}
            justifyContent={"end"}
            flexDirection={"row"}
            alignItems={"center"}
            gap={4}
          >
            <Typography
              variant="headingSmall"
              color="text.light"
              display={"block"}
            >
              {footer.connectLabel}
            </Typography>

            {/* Social Icons */}
            <Box display="flex" gap={2}>
              {socialLinks.map((social, index) => {
                const IconComponent = SOCIAL_ICONS[social.platform];
                return (
                  <MuiLink
                    key={index}
                    href={social.url}
                    target="_blank"
                    sx={{
                      color: "text.light",
                      opacity: 0.7,
                      transition: "opacity 0.2s",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <IconComponent sx={{ fontSize: "28px" }} />
                  </MuiLink>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
