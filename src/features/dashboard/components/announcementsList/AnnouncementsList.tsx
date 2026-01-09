/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import AnnouncementCard, {
  type IAnnouncementResponse,
} from "./AnnouncementCard";
import { apiendpoint } from "../../../../api/endpoint";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import axios from "axios";

const AnnouncementsList = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [announcementsList, setAnnouncementsList] = useState<
    IAnnouncementResponse[]
  >([]);

  const user = useSelector(userInState);

  const fetchAnnouncement = async () => {
    if (!user?.token) return; // authorization check
    try {
      setIsLoading(true);
      const response = await axios.get(apiendpoint.getAnnouncements, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAnnouncementsList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching announcements list", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [user?.token]);

  // GSAP Auto Scroll
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    if (announcementsList.length === 0) return;

    const container = containerRef.current;
    const content = contentRef.current;

    // Clear old clones
    container.querySelectorAll(".clone").forEach((n) => n.remove());

    // Clone content for seamless scroll
    const clone = content.cloneNode(true) as HTMLDivElement;
    clone.classList.add("clone");
    container.appendChild(clone);

    const contentHeight = content.scrollHeight;
    if (contentHeight === 0) return;

    tweenRef.current?.kill();

    tweenRef.current = gsap.to(container, {
      scrollTop: contentHeight,
      duration: announcementsList.length * 3 || 10,
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
      customClasses="p-5 pt-0 w-[41%] h-full max-h-98.75 overflow-y-hidden scrollbar-hide"
    >
      <h4 className="text-black font-semibold text-2xl sticky top-0 bg-white z-10 w-full pt-4 pb-2">
        Announcements
      </h4>

      <div ref={contentRef} className="flex flex-col gap-y-3 mt-4">
        {isLoading ? (
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
              title={announce.attributes.Title}
              description={announce.attributes.Description}
              date={announce.attributes.Date}
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

export default AnnouncementsList;
