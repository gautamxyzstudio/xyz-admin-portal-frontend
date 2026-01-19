import dayjs from "dayjs";
import { Icons } from "../../../../assets/myAssets/exporter";

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

const AnnouncementCard: React.FC<AnnouncementItem> = ({
  id,
  title = "Birthday",
  description = "Description",
  date = "10 Jan 2205",
}) => {
  const getIcon = (title: string) => {
    switch (title) {
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
  const containsHtml = description && /<[^>]*>/g.test(description);
  return (
    <div
      key={id}
      className="bg-background rounded-xl p-4 w-full h-auto flex flex-col gap-y-1 "
    >
      <div className="w-full flex flex-row flex-nowrap items-center justify-between  ">
        <div className="flex flex-row flex-nowrap items-center gap-x-1.5">
          <img
            alt={title}
            src={getIcon(title)}
            className="bg-primary-20 rounded-lg p-1 object-contain w-8 h-8"
          />
          <span className="text-black text-base">{title}</span>
        </div>
        <span className="px-3 py-1 bg-white text-black text-base rounded-lg">
          {dayjs(date).format("DD MMM YYYY")}
        </span>
      </div>
      {containsHtml ? (
        <p
          className="text-base font-medium text-black-80"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <p className="text-base font-medium text-black-80">{description}</p>
      )}
    </div>
  );
};

export default AnnouncementCard;
