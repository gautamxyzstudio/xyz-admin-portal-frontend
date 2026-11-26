import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  Link2,
  Wallet,
  Tag,
  CheckCheck,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import ThemedDropdown from "../../../components/ThemedDropdown";
import {
  useGetFormSubmissionsQuery,
  useMarkFormSubmissionReadMutation,
} from "../formSubmissionsApi";
import type { FormSubmissionStatus, IFormSubmission } from "../formSubmissions.types";

const PAGE_SIZE = 20;

/* ---------------- helpers ---------------- */

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

const timeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms)) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const withProtocol = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

const ReaderChip: React.FC<{ name: string }> = ({ name }) => (
  <span
    title={name}
    className="w-6 h-6 -ml-1.5 first:ml-0 rounded-full bg-primary-20 text-primary text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
  >
    {initials(name)}
  </span>
);

const Field: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-black-20 last:border-0">
    <span className="mt-0.5 text-black-50">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-black-50">{label}</p>
      <div className="text-sm text-black-80 break-words">{children}</div>
    </div>
  </div>
);

/* ---------------- screen ---------------- */

const FormSubmissions: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FormSubmissionStatus>("all");
  const [formType, setFormType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<IFormSubmission | null>(null);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, refetch } = useGetFormSubmissionsQuery(
    {
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      formType: formType === "all" ? undefined : formType,
    },
    { pollingInterval: 60_000, refetchOnFocus: true, refetchOnMountOrArgChange: true },
  );
  const [markRead] = useMarkFormSubmissionReadMutation();

  const rows = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const unreadCount = meta?.unreadCount ?? 0;
  const pagination = meta?.pagination;

  // keep the open item fresh when the list refetches (e.g. readBy updated)
  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? selectedSnapshot,
    [rows, selectedId, selectedSnapshot],
  );

  const open = (row: IFormSubmission) => {
    setSelectedId(row.id);
    setSelectedSnapshot(row);
    if (!row.isRead) {
      markRead(row.id)
        .unwrap()
        .then((res) =>
          setSelectedSnapshot((s) =>
            s && s.id === row.id ? { ...s, readBy: res.readBy, isRead: true } : s,
          ),
        )
        .catch((err) => {
          console.error("Mark as read failed", err);
          toast.error(err?.data?.error?.message || err?.message || "Couldn't mark this submission as read");
        });
    }
  };

  const formTypeOptions = useMemo(
    () => [
      { value: "all", label: "All form types" },
      ...(meta?.formTypes ?? []).map((t) => ({ value: t, label: t })),
    ],
    [meta?.formTypes],
  );

  const tabs: [FormSubmissionStatus, string][] = [
    ["all", "All"],
    ["unread", "Unread"],
    ["read", "Read"],
  ];

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden min-h-0 gap-5">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-black-80 tracking-tight">Form Submissions</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-20 text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-black-50 mt-1">
            Enquiries from the website — who sent them and which Management members have read them
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black-50" size={16} />
            <input
              type="text"
              placeholder="Search name, email, phone or message..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-black-20 rounded-xl text-xs text-black-80 placeholder:text-black-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-xs"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black-50 hover:text-black-80 cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
            className="p-2.5 bg-white border border-black-20 rounded-xl text-black-50 hover:text-primary hover:border-primary transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ---------- Body ---------- */}
      <div className="flex-1 min-h-0 flex gap-5">
        {/* List */}
        <div className="w-[42%] min-w-[320px] flex flex-col bg-white rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 border-b border-black-20">
            <div className="flex gap-4">
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setStatus(key);
                    setPage(1);
                  }}
                  className={`pb-2.5 text-sm cursor-pointer border-b-2 transition-colors ${
                    status === key
                      ? "border-primary text-primary font-semibold"
                      : "border-transparent text-black-50 hover:text-black-80"
                  }`}
                >
                  {label}
                  {key === "unread" && unreadCount > 0 && (
                    <span className="ml-1 text-xs opacity-70">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
            {formTypeOptions.length > 2 && (
              <div className="pb-2">
                <ThemedDropdown<string>
                  value={formType}
                  options={formTypeOptions}
                  onChange={(v) => {
                    setFormType(v);
                    setPage(1);
                  }}
                  align="right"
                  ariaLabel="Form type"
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <CircularProgress size={28} />
              </div>
            ) : rows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-black-50 gap-2 p-6 text-center">
                <Inbox size={32} />
                <p className="text-sm">
                  {status === "unread" ? "You're all caught up." : "No form submissions found."}
                </p>
              </div>
            ) : (
              rows.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => open(r)}
                    className={`w-full text-left px-4 py-3 border-b border-black-20 flex gap-3 cursor-pointer transition-colors ${
                      active ? "bg-primary-20/50" : r.isRead ? "hover:bg-black-20/30" : "bg-orange-50/40 hover:bg-orange-50"
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${r.isRead ? "bg-transparent" : "bg-primary"}`}
                      title={r.isRead ? "Read" : "New"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${r.isRead ? "text-black-80" : "text-black-80 font-semibold"}`}>
                          {r.name || r.email || "Unknown"}
                        </p>
                        <span className="text-[11px] text-black-50 shrink-0" title={formatDateTime(r.createdAt)}>
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-black-50 truncate">
                        {[r.formType, r.email].filter(Boolean).join(" · ") || "—"}
                      </p>
                      {r.message && <p className="text-xs text-black-50 truncate mt-0.5">{r.message}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        {r.readBy.length > 0 ? (
                          <>
                            <div className="flex">
                              {r.readBy.slice(0, 4).map((u) => (
                                <ReaderChip key={u.id} name={u.name} />
                              ))}
                            </div>
                            <span className="text-[11px] text-black-50 truncate">
                              Read by {r.readBy.map((u) => u.name).join(", ")}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-orange-500">Not read by anyone yet</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {pagination && pagination.pageCount > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-black-20 text-xs text-black-50">
              <span>
                {(pagination.page - 1) * pagination.pageSize + 1}–
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg hover:bg-black-20/40 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= pagination.pageCount}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg hover:bg-black-20/40 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-xs overflow-y-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-black-50 gap-2">
              <Mail size={32} />
              <p className="text-sm">Select a submission to see the details</p>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-full bg-primary-20 text-primary font-bold flex items-center justify-center shrink-0">
                    {initials(selected.name || selected.email || "?")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-black-80 truncate">
                      {selected.name || "Unknown"}
                    </h2>
                    <p className="text-xs text-black-50">Submitted {formatDateTime(selected.createdAt)}</p>
                  </div>
                </div>
                {selected.formType && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-20 text-primary shrink-0">
                    {selected.formType}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <div>
                  {selected.email && (
                    <Field icon={<Mail size={15} />} label="Email">
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                        {selected.email}
                      </a>
                    </Field>
                  )}
                  {selected.phone && (
                    <Field icon={<Phone size={15} />} label="Phone">
                      <a href={`tel:${selected.phone}`} className="text-primary hover:underline">
                        {selected.phone}
                      </a>
                    </Field>
                  )}
                  {selected.website && (
                    <Field icon={<Globe size={15} />} label="Website">
                      <a href={withProtocol(selected.website)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {selected.website}
                      </a>
                    </Field>
                  )}
                </div>
                <div>
                  {selected.budget && (
                    <Field icon={<Wallet size={15} />} label="Budget">
                      {selected.budget}
                    </Field>
                  )}
                  {selected.targetKeywords && (
                    <Field icon={<Tag size={15} />} label="Target keywords">
                      {selected.targetKeywords}
                    </Field>
                  )}
                  {selected.pageUrl && (
                    <Field icon={<Link2 size={15} />} label="Submitted from">
                      <a href={withProtocol(selected.pageUrl)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {selected.pageUrl}
                      </a>
                    </Field>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-black-50 mb-1.5">Message</p>
                <div className="text-sm text-black-80 whitespace-pre-wrap bg-black-20/20 rounded-xl p-4 min-h-16">
                  {selected.message || <span className="text-black-50">No message</span>}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-black-50 mb-2 flex items-center gap-1.5">
                  <CheckCheck size={14} /> Read by ({selected.readBy.length})
                </p>
                {selected.readBy.length === 0 ? (
                  <p className="text-sm text-black-50">Nobody has read this yet.</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-black-20 border border-black-20 rounded-xl">
                    {[...selected.readBy]
                      .sort((a, b) => a.readAt.localeCompare(b.readAt))
                      .map((u) => (
                        <li key={u.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <ReaderChip name={u.name} />
                            <span className="text-sm text-black-80">{u.name}</span>
                          </div>
                          <span className="text-xs text-black-50">{formatDateTime(u.readAt)}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormSubmissions;
