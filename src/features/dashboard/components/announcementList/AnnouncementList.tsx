import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import AnnouncementCard from "../../../announcements/components/AnnouncementCard/AnnouncementCard";
import { useGetAnnouncementsQuery } from "../../../announcements/announcementsApi";

const AnnouncementList = ({ customHeight }: { customHeight: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const {
    data: announcementsList = [],
    isLoading,
    isFetching,
  } = useGetAnnouncementsQuery();

  // GSAP Auto Scroll
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    // ❌ Do NOT auto-scroll if announcements <= 3
    if (announcementsList.length <= 3) {
      tweenRef.current?.kill();
      tweenRef.current = null;

      // remove clones if any
      containerRef.current
        .querySelectorAll(".clone")
        .forEach((n) => n.remove());

      return;
    }

    const container = containerRef.current;
    const content = contentRef.current;

    // Clear old clones
    container.querySelectorAll(".clone").forEach((n) => n.remove());

    // Clone content for seamless scroll
    const clone = content.cloneNode(true) as HTMLDivElement;
    clone.classList.add("clone");
    container.appendChild(clone);

    const contentHeight = content.scrollHeight;
    if (!contentHeight) return;

    tweenRef.current?.kill();

    tweenRef.current = gsap.to(container, {
      scrollTop: contentHeight,
      duration: announcementsList?.length * 3,
      ease: "none",
      repeat: -1,
      modifiers: {
        scrollTop: (value) => `${parseFloat(value) % contentHeight}`,
      },
    });

    const pause = () => tweenRef.current?.pause();
    const play = () => tweenRef.current?.play();

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", play);
    container.addEventListener("wheel", pause);

    return () => {
      tweenRef.current?.kill();
      clone.remove();
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", play);
      container.removeEventListener("wheel", pause);
    };
  }, [announcementsList.length]);

  return (
    <CustomBox
      compRef={containerRef}
      customClasses={`p-5 pt-0 w-[41%] ${customHeight} ${
        announcementsList.length > 3 ? "overflow-y-hidden" : "overflow-y-auto"
      } scrollbar-hide`}
    >
      <h4 className="text-black font-semibold text-2xl sticky top-0 bg-white z-10 w-full pt-4 pb-2">
        Announcements
      </h4>

      <div ref={contentRef} className="flex flex-col gap-y-3 mt-4">
        {isLoading || isFetching ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-background animate-pulse w-full h-30 rounded-2xl"
            />
          ))
        ) : announcementsList.length > 0 ? (
          announcementsList.map((announce) => (
            <AnnouncementCard
              key={announce.id}
              id={announce.id}
              title={announce.title}
              description={announce.description}
              date={announce.date}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center w-full py-6">
            No announcements available
          </p>
        )}
      </div>
    </CustomBox>
  );
};

export default AnnouncementList;
