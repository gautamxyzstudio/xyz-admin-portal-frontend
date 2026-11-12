import dayjs from "dayjs";
import { Icons } from "../../../../assets/myAssets/exporter";
import {
  type CelebrationKind,
  celebrationKind,
  extractNames,
  istToday,
  playCelebration,
  stripHtml,
} from "../../celebrations";

export type AnnouncementItem = {
  id: number;
  title: string;
  description: string;
  date: string;
};
export type IAnnouncementResponse = {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Date: string;
  };
};

const KIND_UI: Record<CelebrationKind, { emoji: string; card: string; deco: string[]; hint: string }> = {
  birthday: {
    emoji: "🎂",
    card: "ann-card-birthday",
    deco: ["🎈", "🎉", "🎈"],
    hint: "Click to celebrate 🎉",
  },
  joining: {
    emoji: "👋",
    card: "ann-card-joining",
    deco: ["✨", "🌟", "✨"],
    hint: "Click to welcome 👋",
  },
  anniversary: {
    emoji: "🏆",
    card: "ann-card-anniversary",
    deco: ["⭐", "✨", "⭐"],
    hint: "Click to cheer 🥂",
  },
};

const AnnouncementCard: React.FC<AnnouncementItem> = ({
  id,
  title = "Announcement",
  description = "",
  date = "",
}) => {
  const kind = celebrationKind(title);
  const isToday = !!date && String(date).slice(0, 10) === istToday();
  const containsHtml = description && /<[^>]*>/g.test(description);

  const getIcon = (t: string) => {
    switch (t) {
      case "Happy Birthday!":
        return Icons.BIRTHDAY;
      case "Work Anniversary":
        return Icons.ANNIVERSARY;
      case "New Employee Joined":
        return Icons.PROFILE;
      default:
        return Icons.ANNOUNCE;
    }
  };

  const celebrate = () => {
    if (!kind) return;
    playCelebration({
      key: `replay:${id}:${Date.now()}`,
      kind,
      names: extractNames(description),
      isSelf: false,
      message: stripHtml(description),
    });
  };

  const ui = kind ? KIND_UI[kind] : null;

  return (
    <div
      key={id}
      onClick={ui ? celebrate : undefined}
      role={ui ? "button" : undefined}
      tabIndex={ui ? 0 : undefined}
      onKeyDown={ui ? (e) => (e.key === "Enter" || e.key === " ") && celebrate() : undefined}
      title={ui?.hint}
      className={`ann-card relative overflow-hidden rounded-xl p-4 w-full h-auto flex flex-col gap-y-1.5 ${
        ui ? `${ui.card} cursor-pointer` : "bg-background"
      } ${ui && isToday ? "ann-card-live" : ""}`}
    >
      {/* floating decorations for celebration cards */}
      {ui && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {ui.deco.map((d, i) => (
            <span key={i} className={`ann-deco ann-deco-${i}`}>
              {d}
            </span>
          ))}
        </span>
      )}

      <div className="relative w-full flex flex-row flex-nowrap items-center justify-between gap-2">
        <div className="flex flex-row flex-nowrap items-center gap-x-2 min-w-0">
          {ui ? (
            <span className={`ann-emoji ann-emoji-${kind} grid place-items-center w-9 h-9 rounded-xl bg-white shadow-sm text-xl shrink-0`}>
              {ui.emoji}
            </span>
          ) : (
            <img
              alt={title}
              src={getIcon(title)}
              className="bg-primary-20 rounded-lg p-1 object-contain w-8 h-8 shrink-0"
            />
          )}
          <span className="text-black text-base font-medium truncate">{title}</span>
        </div>
        <span className="px-3 py-1 bg-white/90 text-black text-sm rounded-lg shrink-0">
          {isToday ? "Today" : dayjs(date).format("DD MMM YYYY")}
        </span>
      </div>
      {containsHtml ? (
        <p
          className="relative text-base font-medium text-black-80 [&_b]:text-primary"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <p className="relative text-base font-medium text-black-80">{description}</p>
      )}
      {ui && <span className="relative text-[11px] text-black-50">{ui.hint}</span>}
    </div>
  );
};

export default AnnouncementCard;
