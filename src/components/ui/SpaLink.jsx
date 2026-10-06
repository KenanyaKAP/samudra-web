import { Box } from "@mui/material";
import { useNavigation } from "../../hooks/useNavigation";

/**
 * A real <a href> (so open-in-new-tab and crawlers work) that navigates
 * inside the SPA, with the page fade, on a plain left click.
 */
function SpaLink({ to, children, sx = {}, ...rest }) {
  const { navigateWithFade } = useNavigation();

  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigateWithFade(to);
  };

  return (
    <Box component="a" href={to} onClick={onClick} sx={{ color: "inherit", textDecoration: "none", ...sx }} {...rest}>
      {children}
    </Box>
  );
}

export default SpaLink;
