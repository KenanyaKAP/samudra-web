import { Box } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import TestimonialCard from "./TestimonialCard";

export default function TestimonialCarousel({ testimonials = [] }) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: true,
    },
    [AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false })]
  );

  return (
    <Box
      ref={emblaRef}
      sx={{
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 6,
          py: 2,
        }}
      >
        {testimonials.map((testimonial, index) => (
          <Box
            key={index}
            sx={{
              flex: "0 0 100%",
              minWidth: 0,
              maxWidth: { xs: "90%", sm: "80%", md: "50%" },
              "@media (min-width: 1920px)": {
                maxWidth: "50%",
              },
            }}
            pl={index === 0 ? 6 : 0}
          >
            <TestimonialCard
              image={testimonial.image}
              title={testimonial.title}
              location={testimonial.location}
              text={testimonial.text}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
