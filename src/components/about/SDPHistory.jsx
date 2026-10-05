import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { FadeScroll } from "../ui/FadeScroll";

/**
 * A single expandable history accordion item.
 * Shows the time period and expands to reveal a description.
 */
function SDPHistoryItem({ item, isOpen, onToggle, isLast = false }) {
  return (
    <Box
      width="100%"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        ...(isLast && !isOpen
          ? { borderBottom: "1px solid", borderBottomColor: "divider" }
          : {}),
      }}
    >
      {/* Header row — toggle trigger */}
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          py: { xs: 2.5, md: 3 },
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Typography
          variant="headingSmall"
          sx={{
            fontWeight: isOpen ? 700 : 400,
            color: isOpen ? "primary.main" : "text.disabled",
            transition: "color 0.3s ease, font-weight 0.3s ease",
          }}
        >
          {item.period}
        </Typography>
      </Box>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: "hidden", width: "100%" }}
          >
            <Box pb={{ xs: 3, md: 4 }}>
              <Typography
                variant="bodyLarge"
                color="text.secondary"
                display="block"
                textAlign="justify"
              >
                {item.description}
              </Typography>
            </Box>

            {/* Bottom border when expanded */}
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

/**
 * Accordion-style history timeline for the About page.
 * Only one item can be open at a time.
 *
 * @param {Array} history - Array of { period, description } objects
 * @param {number} defaultOpenIndex - Index of the item to open by default (0-based)
 *
 * @example
 * <SDPHistory history={historyData} defaultOpenIndex={4} />
 */
function SDPHistory({ history = [], defaultOpenIndex = null }) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <Box width="100%">
      {history.map((item, index) => (
        <FadeScroll key={index} delay={index * 0.06}>
          <SDPHistoryItem
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
            isLast={index === history.length - 1}
          />
        </FadeScroll>
      ))}
    </Box>
  );
}

export default SDPHistory;
