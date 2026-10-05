import { Box } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useEffect } from "react";

function InfiniteImageScroll({
  images,
  height = "400px",
  speed = 3,
  direction = "ltr", // "ltr" or "rtl"
  spacing = "0em",
  draggable = true,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: draggable,
      watchDrag: draggable,
      align: "start",
      containScroll: false,
      direction: direction,
    },
    [
      AutoScroll({
        speed: speed,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        playOnInit: true,
      }),
    ]
  );

  // Resume auto-scroll after user interaction
  useEffect(() => {
    if (!emblaApi) return;

    const autoScroll = emblaApi.plugins().autoScroll;
    if (!autoScroll) return;

    const onPointerUp = () => {
      // Small delay before resuming to make interaction feel natural
      setTimeout(() => {
        autoScroll.play();
      }, 500);
    };

    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  return (
    <Box
      ref={emblaRef}
      overflow={"hidden"}
      sx={{
        cursor: draggable ? "grab" : "default",
        "&:active": {
          cursor: draggable ? "grabbing" : "default",
        },
      }}
    >
      <Box
        display={"flex"}
        flexDirection={direction === "rtl" ? "row-reverse" : "row"}
        sx={{
          gap: spacing,
          height: height,
        }}
      >
        {images.map((imgSrc, index) => (
          <Box
            key={index}
            sx={{
              flex: "0 0 auto",
              minWidth: 0,
              mx: 1,
            }}
          >
            <img
              src={imgSrc}
              alt={`Image ${index + 1}`}
              style={{
                height: "100%",
                width: "auto",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default InfiniteImageScroll;
