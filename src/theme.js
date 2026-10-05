import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Montserrat is self-hosted (src/fonts.css). OLD listed "Metropolis" first in
// the heading stacks, but its font files never shipped, so every heading has
// always rendered in Montserrat — dropping it changes nothing on screen.
const FONT_FAMILY = "'Montserrat Variable', 'Montserrat', sans-serif";

// Create a custom theme for Samudra
let theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1728,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#EA1F25",
      light: "#FF5252",
      dark: "#B71C1C",
    },
    background: {
      default: "#ffffff",
      paper: "#F5F5F5",
      gray: "#616161",
      darkgray: "#2b2b2b",
      dark: "#1A1A1A",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#555555",
      light: "#ffffff",
    },
  },
  typography: {
    fontFamily: FONT_FAMILY,

    // === Heading Variants ===
    headingLarge: {
      fontFamily: FONT_FAMILY,
      fontSize: "2.8rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    headingMedium: {
      fontFamily: FONT_FAMILY,
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    headingSmall: {
      fontFamily: FONT_FAMILY,
      fontSize: "1.4rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },

    // === Body Variants ===
    bodyLarge: {
      fontSize: "1.125rem",
      fontWeight: 400,
      lineHeight: 1.7,
    },
    bodyMedium: {
      fontSize: "0.95rem",
      fontWeight: 400,
      lineHeight: 1.7,
    },
    bodySmall: {
      fontSize: "0.8rem",
      fontWeight: 400,
      lineHeight: 1.6,
    },

    // === Special Variants ===
    sectionLabel: {
      fontFamily: FONT_FAMILY,
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
    },
    statNumber: {
      fontFamily: FONT_FAMILY,
      fontSize: "3rem",
      fontWeight: 700,
      lineHeight: 1.1,
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "0.6em 1.8em",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "4px",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: "24px",
          paddingRight: "24px",
          [theme.breakpoints.up("sm")]: {
            paddingLeft: "32px",
            paddingRight: "32px",
          },
          [theme.breakpoints.up("md")]: {
            paddingLeft: "48px",
            paddingRight: "48px",
          },
        }),
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
