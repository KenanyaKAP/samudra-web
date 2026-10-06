import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import { NavigationProvider, useNavigation } from "./hooks/useNavigation";
import { SiteDataProvider } from "./hooks/useSiteData";
import Home from "./pages/Home";
import About from "./pages/About";
import People from "./pages/People";
import Services from "./pages/Services";
import PortfolioDetail from "./pages/PortfolioDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";
import Career from "./pages/Career";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import "./App.css";

// The About sub-pages of the old site. WordPress answers them with a 301
// (samudra_legacy_redirects() in theme/functions.php); these cover the Vite
// dev server and in-app links.
const LEGACY_REDIRECTS = {
  "/about/history": "/about",
  "/about/company": "/about",
  "/about/vision": "/about",
  "/about/values": "/about",
  "/about/awards": "/about",
  "/about/management": "/people",
};

// Keep this route list in sync with samudra_spa_routes() in
// theme/functions.php, which answers unknown paths with a 404 status.
function AppLayout() {
  const { isFading } = useNavigation();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1 }} className={isFading ? "fade-out" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/people" element={<People />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<PortfolioDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<Career />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer key={location.pathname} />
      </Box>

      <WhatsAppButton />
    </Box>
  );
}

function App() {
  return (
    <Router>
      <NavigationProvider>
        <SiteDataProvider>
          <AppLayout />
        </SiteDataProvider>
      </NavigationProvider>
    </Router>
  );
}

export default App;
