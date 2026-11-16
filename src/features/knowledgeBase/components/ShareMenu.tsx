import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, FileDown, Link2, Loader2, Mail, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";

interface Props {
  /** What is being shared, e.g. the article title or "Xyz Portal knowledge base". */
  title: string;
  /** Portal link to open it (recipient has to log in and have project access). */
  url: string;
  /** Builds the PDF to share as a file. */
  getPdf: () => Promise<File>;
  /** Compact button for the article toolbar. */
  compact?: boolean;
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback for non-secure contexts (plain http on LAN)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
};

const ShareMenu: React.FC<Props> = ({ title, url, getPdf, compact }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const message = `${title}\n${url}`;

  const copyLink = async () => {
    if (await copyText(url)) {
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error("Couldn't copy the link");
    }
    setOpen(false);
  };

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    setOpen(false);
  };

  const email = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
      `Hi,\n\nHere's the documentation: ${title}\n${url}\n\n(You'll need to log in to the XYZ Portal to open it.)`,
    )}`;
    setOpen(false);
  };

  const sharePdf = async () => {
    setSharingPdf(true);
    try {
      const file = await getPdf();
      const data: ShareData = { files: [file], title, text: title };
      if (navigator.canShare?.(data) && navigator.share) {
        await navigator.share(data);
      } else {
        // device can't share files — download it so it can be attached manually
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        toast.info("This device can't share files directly — the PDF was downloaded so you can attach it");
      }
    } catch (err) {
      if ((err as DOMException)?.name !== "AbortError") {
        console.error("Share PDF failed", err);
        toast.error("Couldn't share the PDF");
      }
    } finally {
      setSharingPdf(false);
      setOpen(false);
    }
  };

  const item =
    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-black-80 hover:bg-primary-20 hover:text-primary transition-colors cursor-pointer disabled:opacity-60 text-left";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Share"
        className={
          compact
            ? "inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold text-black-50 hover:text-primary hover:bg-gray-50 cursor-pointer"
            : "inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-black-80 hover:border-primary hover:text-primary transition-colors cursor-pointer"
        }
      >
        {copied ? <Check size={compact ? 14 : 15} /> : <Share2 size={compact ? 14 : 15} />}
        Share
        {!compact && <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-56 p-1.5 rounded-xl bg-white border border-gray-100 shadow-lg z-30"
        >
          <button role="menuitem" className={item} onClick={copyLink}>
            <Link2 size={15} /> Copy link
          </button>
          <button role="menuitem" className={item} onClick={whatsapp}>
            <FaWhatsapp size={15} /> WhatsApp
          </button>
          <button role="menuitem" className={item} onClick={email}>
            <Mail size={15} /> Email
          </button>
          <button role="menuitem" className={item} onClick={sharePdf} disabled={sharingPdf}>
            {sharingPdf ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
            {sharingPdf ? "Preparing PDF…" : "Share as PDF"}
          </button>
          <p className="px-3 pt-1.5 pb-1 text-[10.5px] leading-snug text-black-50 border-t border-gray-100 mt-1">
            Links open in the portal — people need to log in and be on this project.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
