import React, { useState } from "react";
import dayjs from "dayjs";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { getIstTodayDateString } from "../../../utils/istDateUtils";
import {
  useAddTaskManualTimeMutation,
  useDeleteTaskManualTimeMutation,
  useGetTaskManualTimeQuery,
} from "../taskApi";

const fmt = (seconds: number) => {
  const m = Math.round((seconds || 0) / 60);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
};

const errMsg = (e: any, fallback: string) =>
  e?.data?.error?.message || e?.message || fallback;

/**
 * Manual time for tasks assigned to Management / HR (no timer for Management).
 * Hidden automatically when the assignee is anyone else.
 */
const TaskManualTimeSection: React.FC<{ taskId?: number | string }> = ({ taskId }) => {
  const today = getIstTodayDateString();
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading } = useGetTaskManualTimeQuery(taskId as number, { skip: !taskId });
  const [addTime, { isLoading: adding }] = useAddTaskManualTimeMutation();
  const [deleteTime, { isLoading: deleting }] = useDeleteTaskManualTimeMutation();

  if (!taskId || isLoading || !data?.allowed) return null;

  const total = (Number(hours) || 0) * 60 + (Number(minutes) || 0);

  const submit = async () => {
    if (total < 1) return toast.error("Enter hours or minutes");
    try {
      await addTime({ taskId, date: date || today, minutes: total, note: note.trim() || undefined }).unwrap();
      toast.success(`${fmt(total * 60)} added`);
      setHours("");
      setMinutes("");
      setNote("");
    } catch (e) {
      toast.error(errMsg(e, "Couldn't add time"));
    }
  };

  const remove = async (key: string) => {
    try {
      await deleteTime({ taskId, key }).unwrap();
    } catch (e) {
      toast.error(errMsg(e, "Couldn't remove time"));
    }
  };

  const inputCls =
    "w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="rounded-2xl border border-slate-200/80 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Clock size={14} className="text-primary" /> Time spent (manual)
        </h4>
        <span className="text-xs text-slate-500">
          Total <span className="font-semibold text-slate-800">{fmt(data.totalSeconds)}</span>
        </span>
      </div>

      {data.canEdit && (
        <>
          <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-2 items-center">
            <ThemedDatePicker
              value={date}
              onChange={setDate}
              max={today}
              format={(d) => dayjs(d).format("DD MMM YYYY")}
              shortcuts={[
                { label: "Today", day: today },
                { label: "Yesterday", day: dayjs(today).subtract(1, "day").format("YYYY-MM-DD") },
              ]}
            />
            <div className="relative">
              <input
                type="number"
                min={0}
                max={16}
                placeholder="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={`${inputCls} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">h</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={59}
                step={5}
                placeholder="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={`${inputCls} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">m</span>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={adding || total < 1}
              className="h-full px-4 rounded-2xl bg-primary text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <input
            type="text"
            placeholder="Note (optional) — e.g. client call, reviewing sheet"
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
            className={inputCls}
          />
        </>
      )}

      {data.entries.length === 0 ? (
        <p className="text-[11px] text-slate-500">No time added yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 border border-slate-100 rounded-xl">
          {data.entries.map((e) => (
            <li key={e.key} className="flex items-center gap-3 px-3 py-2">
              <span className="text-sm font-semibold text-slate-800 w-16 shrink-0">{fmt(e.seconds)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-700">
                  {dayjs(e.date).format("DD MMM YYYY")}
                  {e.addedBy?.name && <span className="text-slate-400"> · added by {e.addedBy.name}</span>}
                </p>
                {e.note && <p className="text-[11px] text-slate-500 truncate">{e.note}</p>}
              </div>
              {data.canEdit && (
                <button
                  type="button"
                  title="Remove"
                  disabled={deleting}
                  onClick={() => remove(e.key)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskManualTimeSection;
