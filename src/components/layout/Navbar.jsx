import { useEffect, useState } from "react";
import { Box, ButtonBase, Drawer, Typography, useMediaQuery, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";
import { useSection } from "../../hooks/useSiteData";
import { block, fluid } from "../../utils/design";
import SearchOverlay from "./SearchOverlay";

/** Three bars that fold into an ×. */
function Hamburger({ open }) {
  return (
    <Box sx={{ position: "relative", width: 26, height: 18 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            left: 0,
            width: "100%",
            height: 2,
            bgcolor: "common.white",
            top: open ? 8 : i * 8,
            opacity: open && i === 1 ? 0 : 1,
            transform: open ? `rotate(${i === 0 ? 45 : i === 2 ? -45 : 0}deg)` : "none",
            transition: "transform .25s ease, top .25s ease, opacity .2s ease",
          }}
        />
      ))}
    </Box>
  );
}

// Frosted glass, as on iOS: what scrolls behind the bar is blurred and its
// colours boosted, under a dark tint, with a sheen from the top-left.
// Browsers without backdrop-filter keep the plain translucent bar.
const GLASS = {
  // Over white the tint alone sets the contrast of the white labels: 0.48
  // keeps it at least as high as the old flat bar.
  bgcolor: "rgba(24, 22, 22, 0.48)",
  backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0) 100%)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.14)",
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))": {
    bgcolor: "brand.nav",
    backgroundImage: "none",
  },
  // The glass rim: a 1 px ring that catches the light along the top, fades
  // down the sides and glints again at the bottom. It follows the corner
  // radii and sits above the red tab, so the outline never breaks.
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    padding: "1px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.14) 30%, rgba(255,255,255,0.06) 70%, rgba(255,255,255,0.22) 100%)",
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    maskComposite: "exclude",
    pointerEvents: "none",
    zIndex: 1,
  },
};

// The design's shape: one large rounded corner bottom-left. The other three
// get a small radius so the glass edge does not end in hard points.
const SOFT_CORNER = { xs: 6, lg: fluid(8, 6) };

function isActive(pathname, path) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

/**
 * Floating navigation bar (New Design.pdf): a frosted-glass bar 1532 px
 * wide and 96 px tall, 47 px from the top at 1920. The current page is a red
 * tab the full height of the bar. Below the lg breakpoint it collapses into a
 * full-screen menu.
 */
function Navbar() {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("lg"));
  const { pathname } = useLocation();
  const { navigateWithFade } = useNavigation();
  const { logo, nav = [] } = useSection("global");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Leaving the compact layout (rotating a tablet) must not strand the menu.
  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  const go = (path) => {
    setMenuOpen(false);
    navigateWithFade(path);
  };

  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: { xs: 12, lg: fluid(47, 24) },
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          pointerEvents: "none",
        }}
      >
        <Box
          component="nav"
          aria-label="Main"
          sx={{
            ...block(1532),
            pointerEvents: "auto",
            height: { xs: 64, lg: fluid(96, 72) },
            position: "relative",
            ...GLASS,
            borderTopLeftRadius: SOFT_CORNER,
            borderTopRightRadius: SOFT_CORNER,
            borderBottomRightRadius: SOFT_CORNER,
            borderBottomLeftRadius: { xs: 18, lg: fluid(30, 20) },
            display: "flex",
            alignItems: "stretch",
            pl: { xs: 2.5, lg: fluid(88, 32) },
            pr: { xs: 1.5, lg: fluid(78, 24) },
          }}
        >
          <ButtonBase
            onClick={() => go("/")}
            aria-label="Samudra — Home"
            sx={{ alignSelf: "center", mr: "auto", "&:hover": { opacity: 0.85 } }}
          >
            <Box
              component="img"
              src={logo}
              alt="Samudra"
              sx={{ height: { xs: 30, lg: fluid(43, 30) }, width: "auto", display: "block" }}
            />
          </ButtonBase>

          {!compact &&
            nav.map((item) => {
              const active = isActive(pathname, item.path);
              return (
                <ButtonBase
                  key={item.path + item.label}
                  onClick={() => go(item.path)}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    width: fluid(125, 92),
                    bgcolor: active ? "primary.main" : "transparent",
                    borderBottomLeftRadius: active ? fluid(14, 10) : 0,
                    color: "common.white",
                    transition: "color .2s ease",
                    "&:hover": { color: active ? "common.white" : "primary.main" },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: fluid(16, 13),
                      fontWeight: 600,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {item.label}
                  </Typography>
                </ButtonBase>
              );
            })}

          <ButtonBase
            onClick={openSearch}
            aria-label="Search"
            sx={{
              width: { xs: 48, lg: fluid(70, 52) },
              color: "common.white",
              "&:hover": { color: "primary.main" },
            }}
          >
            <SearchIcon sx={{ fontSize: { xs: 26, lg: fluid(26, 22) } }} />
          </ButtonBase>

          {compact && (
            <ButtonBase
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              sx={{ width: 48 }}
            >
              <Hamburger open={menuOpen} />
            </ButtonBase>
          )}
        </Box>
      </Box>

      {/* Compact layout: full-screen menu under the bar */}
      <Drawer
        anchor="top"
        open={compact && menuOpen}
        onClose={() => setMenuOpen(false)}
        // Under the bar, which stays clickable to close the menu again.
        sx={{ zIndex: theme.zIndex.appBar - 1 }}
        ModalProps={{ disableEnforceFocus: true }}
        slotProps={{
          paper: {
            sx: {
              height: "100dvh",
              bgcolor: "brand.page",
              backgroundImage: "none",
              pt: 14,
              px: { xs: 3, sm: 6 },
            },
          },
        }}
      >
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {nav.map((item) => {
            const active = isActive(pathname, item.path);
            return (
              <Box component="li" key={item.path + item.label}>
                <ButtonBase
                  onClick={() => go(item.path)}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    py: 1.6,
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                    color: active ? "primary.main" : "common.white",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: active ? 700 : 600, textTransform: "uppercase" }}
                  >
                    {item.label}
                  </Typography>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      </Drawer>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;
