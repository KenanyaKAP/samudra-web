import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { NavigationProvider, useNavigation } from "./hooks/useNavigation";
import { SiteDataProvider } from "./hooks/useSiteData";
import Home from "./pages/Home";
import About from "./pages/About";
import HistoryPage from "./pages/about/HistoryPage";
import CompanyPage from "./pages/about/CompanyPage";
import VisionPage from "./pages/about/VisionPage";
import ValuesPage from "./pages/about/ValuesPage";
import ManagementPage from "./pages/about/ManagementPage";
import AwardsPage from "./pages/about/AwardsPage";
import Services from "./pages/Services";
import PortfolioDetail from "./pages/PortfolioDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";
import Career from "./pages/Career";
import NotFound from "./pages/NotFound";
import "./App.css";

// Keep this route list in sync with samudra_spa_routes() in
// theme/functions.php, which answers unknown paths with a 404 status.
function AppLayout() {
  const { isFading } = useNavigation();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Box
        component="main"
        sx={{ flexGrow: 1 }}
        className={isFading ? "fade-out" : ""}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/history" element={<HistoryPage />} />
          <Route path="/about/company" element={<CompanyPage />} />
          <Route path="/about/vision" element={<VisionPage />} />
          <Route path="/about/values" element={<ValuesPage />} />
          <Route path="/about/management" element={<ManagementPage />} />
          <Route path="/about/awards" element={<AwardsPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<PortfolioDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<Career />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer key={location.pathname} />
      </Box>
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
