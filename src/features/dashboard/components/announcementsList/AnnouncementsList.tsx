import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import AnnouncementCard, { type AnnouncementItem } from "./AnnouncementCard";

const AnnouncementsList = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // Clone content for seamless loop
    const clone = content.cloneNode(true) as HTMLDivElement;
    container.appendChild(clone);

    const contentHeight = content.scrollHeight;

    const tween = gsap.to(container, {
      scrollTop: contentHeight,
      duration: 25,
      ease: "none",
      repeat: -1,
      modifiers: {
        scrollTop: (value) => `${parseFloat(value) % contentHeight}`,
      },
    });

    // Pause on user interaction
    const stop = () => tween.pause();
    const play = () => tween.play();

    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", play);
    container.addEventListener("wheel", stop);

    return () => {
      tween.kill();
      clone.remove();
      container.removeEventListener("mouseenter", stop);
      container.removeEventListener("mouseleave", play);
      container.removeEventListener("wheel", stop);
    };
  }, []);

  return (
    <CustomBox
      compRef={containerRef}
      customClasses="p-5 pt-0 w-[39%] h-full max-h-98.75 overflow-y-hidden scrollbar-hide"
    >
      <h4 className="text-black font-semibold text-2xl sticky top-0 bg-white z-10 w-full pt-4 pb-2">
        Announcements
      </h4>

      <div ref={contentRef} className="flex flex-col gap-y-3 mt-4">
        {announcementDummyData.map((announce) => (
          <AnnouncementCard
            key={announce.id}
            id={announce.id}
            title={announce.title}
            description={announce.description}
            date={announce.date}
          />
        ))}
      </div>
    </CustomBox>
  );
};

export default AnnouncementsList;

const announcementDummyData: AnnouncementItem[] = [
  {
    id: 1,
    title: "Happy Birthday",
    description: "Wishing John Doe a very happy birthday today 🎉",
    date: "2025-01-10",
  },
  {
    id: 2,
    title: "Work Anniversary",
    description:
      "Congratulations to Sarah Smith on completing 5 years with us 🎊",
    date: "2025-01-12",
  },
  {
    id: 3,
    title: "New Employee Joined",
    description: "Please welcome Alex Johnson to the Engineering team 👋",
    date: "2025-01-14",
  },
  {
    id: 4,
    title: "Company Announcement",
    description:
      "Office will remain closed this Friday due to maintenance work.",
    date: "2025-01-15",
  },
  {
    id: 5,
    title: "Happy Birthday",
    description:
      "Happy Birthday to Emily Clark! Have a wonderful year ahead 🎂",
    date: "2025-01-18",
  },
  {
    id: 6,
    title: "Work Anniversary",
    description:
      "Cheers to Michael Brown on his 3rd work anniversary with us 🎉",
    date: "2025-01-20",
  },
  {
    id: 7,
    title: "New Employee Joined",
    description: "Join us in welcoming Sophia Wilson to the Marketing team 👏",
    date: "2025-01-22",
  },
  {
    id: 8,
    title: "Company Announcement",
    description: "Annual town hall meeting scheduled for next Monday.",
    date: "2025-01-24",
  },
  {
    id: 9,
    title: "Happy Birthday",
    description: "Happy Birthday to Daniel Martinez! Wishing you success 🎈",
    date: "2025-01-26",
  },
  {
    id: 10,
    title: "Work Anniversary",
    description: "Celebrating 10 years of dedication from Laura Anderson 🎖️",
    date: "2025-01-28",
  },
];
