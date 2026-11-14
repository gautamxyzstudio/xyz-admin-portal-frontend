import { Maximize2, Minimize2 } from "lucide-react";

/** Header button that switches between wide and full screen. */
const ModalSizeButton = ({ isFull, onClick }: { isFull: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    title={isFull ? "Exit full screen" : "Full screen"}
    aria-label={isFull ? "Exit full screen" : "Full screen"}
    className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
  >
    {isFull ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
  </button>
);

export default ModalSizeButton;
