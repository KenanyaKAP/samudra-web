import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocation } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";
import { useSection } from "../../hooks/useSiteData";

const AnimatedHamburger = ({
  isOpen,
  onClick,
  width = 30,
  height = 12,
  thickness = 2,
  color = "currentColor",
}) => {
  // Calculate line spacing and rotation based on dimensions
  const lineHeight = thickness;
  const totalLinesHeight = lineHeight * 3;
  const availableSpace = height - totalLinesHeight;
  const spacing = availableSpace / 2; // Space between lines

  // Calculate offset for top and bottom lines when closed
  const lineOffset = spacing + lineHeight;

  // Calculate rotation angle so lines touch corners
  // Using atan2 to get the angle based on width/2 and height/2
  const rotationAngle = Math.atan2(height / 2, width / 2) * (180 / Math.PI);

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height + 10,
        gap: 0,
        cursor: "pointer",
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: width,
            height: lineHeight,
            bgcolor: color,
            transition: "transform 0.3s ease, opacity 0.3s ease",
            transform:
              isOpen && i === 0
                ? `translateY(${lineHeight * 0.9}px) rotate(${rotationAngle}deg)`
                : isOpen && i === 2
                  ? `translateY(${-lineHeight * 0.9}px) rotate(${-rotationAngle}deg)`
                  : `translateY(${i === 0 ? -lineOffset : i === 1 ? 0 : lineOffset}px) rotate(0deg)`,
            opacity: isOpen && i === 1 ? 0 : 1,
          }}
        />
      ))}
    </Box>
  );
};

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { navigateWithFade } = useNavigation();
  const { logo, nav = [] } = useSection("global");

  // Site Content → Global → Nav. Only items with sub-pages get a dropdown.
  const pageItems = nav.map((item) => ({
    text: item.label,
    path: item.path,
    children: item.children?.length
      ? item.children.map((child) => ({ text: child.label, path: child.path }))
      : undefined,
  }));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        pt: 6,
        px: { xs: 3, sm: 4 },
      }}
    >
      {/* Menu Items */}
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {pageItems.map((item) => (
          <Box key={item.text} sx={{
            textTransform: "uppercase",
          }}>
            <ListItem disablePadding>
              <ListItemButton
                component="div"
                onClick={() => {
                  if (mobileOpen) {
                    navigateWithFade(item.path);

                    setTimeout(() => {
                      setMobileOpen(false);
                    }, 150);
                    return;
                  }
                  navigateWithFade(item.path);
                }}
                sx={{
                  py: 0,
                  px: 0,
                  "&:hover": {
                    bgcolor: "transparent",
                    opacity: 0.7,
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    variant: "navLinkMobile",
                    color:
                      location.pathname === item.path ||
                      location.pathname.startsWith(item.path + "/")
                        ? "primary.main"
                        : "text.dark",
                    fontWeight:
                      location.pathname === item.path ||
                      location.pathname.startsWith(item.path + "/")
                        ? "600"
                        : "400",
                  }}
                />
              </ListItemButton>
            </ListItem>
            {/* Children items for mobile */}
            {item.children && (
              <List sx={{ pl: 4 }}>
                {item.children.map((child) => (
                  <ListItem key={child.text} disablePadding>
                    <ListItemButton
                      component="div"
                      onClick={() => {
                        navigateWithFade(child.path);
                        setTimeout(() => {
                          setMobileOpen(false);
                        }, 150);
                      }}
                      sx={{
                        py: 0,
                        px: 0,
                        "&:hover": {
                          bgcolor: "transparent",
                          opacity: 0.7,
                        },
                      }}
                    >
                      <ListItemText
                        primary={child.text}
                        primaryTypographyProps={{
                          variant: "navLinkMobile",
                          color:
                            location.pathname === child.path ||
                            location.pathname.startsWith(child.path + "/")
                              ? "primary.main"
                              : "text.dark",
                          fontWeight:
                            location.pathname === child.path ||
                            location.pathname.startsWith(child.path + "/")
                              ? "600"
                              : "400",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(0,0,0,0.75)",
          backgroundImage: "none",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          // CONFIG padding X
          //   px: { xs: 2, sm: 6, md: 12 },
        }}
      >
        <Container
          maxWidth="xxl"
          display="flex"
          sx={{ py: 0, display: "flex", alignItems: "stretch" }}
        >
          {/* <Toolbar disableGutters> */}
          <Typography
            variant="logo"
            component="div"
            onClick={() => {
              if (mobileOpen) {
                navigateWithFade("/");

                setTimeout(() => {
                  setMobileOpen(false);
                }, 150);
                return;
              }
              navigateWithFade("/");
            }}
            sx={{
              color: "text.light",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 2,
            }}
          >
            {/* SENBO */}
            <img src={logo} alt="Logo" style={{ height: 30 }} />
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <>
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "stretch",
                }}
              >
                {pageItems.map((item) => (
                  <Box
                    key={item.text}
                    sx={{
                      position: "relative",
                      px: 4,
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      bgcolor:
                        location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/")
                          ? "primary.main"
                          : "transparent",
                      borderBottomLeftRadius:
                        location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/")
                          ? "14px"
                          : 0,
                    }}
                  >
                    {item.children && (
                      <Box
                        position={"absolute"}
                        top={0}
                        bottom={-16}
                        left={0}
                        right={0}
                        zIndex={-1}
                        onMouseEnter={() =>
                          item.children && setHoveredDropdown(item.text)
                        }
                        onMouseLeave={() => setHoveredDropdown(null)}
                      />
                    )}
                    {/* Main Menu Item */}
                    <Box
                      onClick={() => {
                        navigateWithFade(item.path);
                      }}
                      onMouseEnter={() =>
                        item.children && setHoveredDropdown(item.text)
                      }
                      onMouseLeave={() => setHoveredDropdown(null)}
                      sx={{
                        color: "text.light",
                        cursor: "pointer",
                        "&:hover": {
                          opacity:
                            location.pathname === item.path ||
                            location.pathname.startsWith(item.path + "/")
                              ? 0.85
                              : 1,
                          color:
                            location.pathname === item.path ||
                            location.pathname.startsWith(item.path + "/")
                              ? "text.light"
                              : "primary.main",
                        },
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="bodyMedium"
                        fontWeight={
                          location.pathname === item.path ||
                          location.pathname.startsWith(item.path + "/")
                            ? "600"
                            : "500"
                        }
                      >
                        {item.text}
                      </Typography>
                      {item.children && (
                        <KeyboardArrowDownIcon
                          sx={{
                            transition: "transform 0.25s ease",
                            transform:
                              hoveredDropdown === item.text
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            fontSize: 22,
                          }}
                        />
                      )}
                    </Box>

                    {/* Dropdown Menu */}
                    {item.children && (
                      <Box
                        onMouseEnter={() => setHoveredDropdown(item.text)}
                        onMouseLeave={() => setHoveredDropdown(null)}
                        sx={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          width: "100%",
                          transform:
                            hoveredDropdown === item.text
                              ? "translateY(0) scaleY(1)"
                              : "translateY(-8px) scaleY(0.96)",
                          transformOrigin: "top center",
                          bgcolor: "primary.main",
                          borderRadius: "0 0 0 28px",
                          mt: 0,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                          zIndex: 1000,
                          overflow: "hidden",
                          opacity: hoveredDropdown === item.text ? 1 : 0,
                          visibility:
                            hoveredDropdown === item.text ? "visible" : "hidden",
                          pointerEvents:
                            hoveredDropdown === item.text ? "auto" : "none",
                          transition:
                            "opacity 0.24s ease, transform 0.24s ease, visibility 0.24s ease",
                        }}
                      >
                        {item.children.map((child) => (
                          <Box
                            key={child.text}
                            onClick={() => {
                              navigateWithFade(child.path);
                              setHoveredDropdown(null);
                            }}
                            sx={{
                              px: 2.2,
                              py: 1.6,
                              color:
                                location.pathname === child.path ||
                                location.pathname.startsWith(child.path + "/")
                                  ? "text.light"
                                  : "text.light",
                              cursor: "pointer",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.14)",
                              },
                              borderBottom: "1px solid",
                              borderColor: "rgba(255,255,255,0.2)",
                              "&:last-child": {
                                borderBottom: "none",
                              },
                              textTransform: "uppercase",
                              fontWeight:
                                location.pathname === child.path ||
                                location.pathname.startsWith(child.path + "/")
                                  ? "600"
                                  : "400",
                              bgcolor:
                                location.pathname === child.path ||
                                location.pathname.startsWith(child.path + "/")
                                  ? "rgba(255,255,255,0.16)"
                                  : "transparent",
                            }}
                          >
                            <Typography
                              variant="bodyMedium"
                              fontWeight={
                                location.pathname === child.path ||
                                location.pathname.startsWith(child.path + "/")
                                  ? "600"
                                  : "400"
                              }
                              sx={{
                                lineHeight: 0,
                              }}
                            >
                              {child.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <AnimatedHamburger
                isOpen={mobileOpen}
                onClick={handleDrawerToggle}
                color={theme.palette.text.light}
              />
            </Box>
          )}
          {/* </Toolbar> */}
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "100%",
            height: "100vh",
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
