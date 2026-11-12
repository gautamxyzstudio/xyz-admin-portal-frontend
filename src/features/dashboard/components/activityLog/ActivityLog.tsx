import { formatIstDateTime, formatIstRelativeTime } from '../../../../utils/istDateUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import ThemedTable, { PersonCell, Pill } from "../../../../components/ThemedTable";
import { useLazyGetLatestActivityLogsQuery } from "../../dashboardApi";

interface IActivityLog {
  id: number;
  createdAt: string;
  title: string;
  description: string;
  user: {
    name: string;
  };
}

type Tone = "orange" | "green" | "red" | "blue" | "gray" | "violet";
const toneOf = (title: string): Tone => {
  const t = title.toLowerCase();
  if (t.includes("approved") || t.includes("created") || t.includes("added")) return "green";
  if (t.includes("declined") || t.includes("rejected") || t.includes("deleted") || t.includes("removed")) return "red";
  if (t.includes("applied") || t.includes("submitted")) return "blue";
  if (t.includes("task")) return "orange";
  if (t.includes("updated") || t.includes("profile")) return "violet";
  return "gray";
};

// "2026-11-10" -> "10 Nov 2026"
const prettyDates = (text: string) =>
  text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m) => {
    const d = dayjs(m);
    return d.isValid() ? d.format("D MMM YYYY") : m;
  });

const ActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<IActivityLog[]>([]);
  const [getLatestActivityLogs, { isFetching: isLoading, }] =
  useLazyGetLatestActivityLogsQuery();

const fetchActivityLogs = async () => {
  try {
    const res = await getLatestActivityLogs().unwrap();
    setActivityLogs(res.data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchActivityLogs();
}, []);

  return (
    <div className="w-full bg-white rounded-2xl flex flex-col p-5 gap-4 mt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-black-80">Activity Logs</h3>
          <p className="text-xs text-black-50 mt-0.5">Latest changes across the portal</p>
        </div>
        <Link
          to="/activity-logs"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary-20 transition-colors"
        >
          View All
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ThemedTable<any>
        className="max-h-[420px]"
        rows={activityLogs as any[]}
        rowKey={(r) => r.id}
        loading={isLoading}
        minWidth={760}
        emptyTitle="No activity logs found"
        columns={[
          {
            key: "when",
            header: "When",
            width: "minmax(130px,1fr)",
            render: (r) => (
              <div className="min-w-0" title={formatIstDateTime(r.attributes?.createdAt, { numericDate: true, uppercase: true })}>
                <p className="font-medium text-black-80">{formatIstRelativeTime(r.attributes?.createdAt)}</p>
                <p className="text-[11px] text-black-50 truncate">
                  {formatIstDateTime(r.attributes?.createdAt, { numericDate: true, uppercase: true })}
                </p>
              </div>
            ),
          },
          {
            key: "title",
            header: "Activity",
            width: "minmax(130px,1fr)",
            render: (r) => {
              const title = r.attributes?.title || "-";
              return <Pill tone={toneOf(title)}>{title}</Pill>;
            },
          },
          {
            key: "description",
            header: "Description",
            width: "minmax(240px,2.6fr)",
            render: (r) => (
              <span className="text-black-80/80 line-clamp-2">{prettyDates(r.attributes?.description || "-")}</span>
            ),
          },
          {
            key: "user",
            header: "By",
            width: "minmax(150px,1.1fr)",
            render: (r) => <PersonCell name={r.attributes?.users_permissions_user?.data?.attributes?.username || "-"} />,
          },
        ]}
      />
    </div>
  );
};

export default ActivityLogs;
