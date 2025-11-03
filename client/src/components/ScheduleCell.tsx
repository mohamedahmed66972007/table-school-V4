import { Plus } from "lucide-react";
import type { ScheduleSlotData } from "@/types/schedule";

interface ScheduleCellProps {
  slot?: ScheduleSlotData;
  onClick: () => void;
  readOnly?: boolean;
}

export default function ScheduleCell({ slot, onClick, readOnly }: ScheduleCellProps) {
  if (!slot) {
    return (
      <button
        onClick={onClick}
        disabled={readOnly}
        className={`w-full h-20 flex items-center justify-center ${
          !readOnly ? 'hover-elevate active-elevate-2 cursor-pointer' : 'cursor-default'
        } transition-all duration-200 border-2 border-dashed border-border/50`}
        data-testid="button-empty-slot"
      >
        {!readOnly && <Plus className="h-5 w-5 text-muted-foreground" />}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={readOnly}
      className={`w-full h-20 p-3 flex flex-col items-center justify-center gap-1 bg-primary/10 ${
        !readOnly ? 'hover-elevate active-elevate-2 cursor-pointer' : 'cursor-default'
      } transition-all duration-200`}
      data-testid={`button-filled-slot-${slot.grade}-${slot.section}`}
    >
      <div className="text-lg font-bold font-data text-primary">
        {slot.grade}/{slot.section}
      </div>
      <div className="text-xs text-muted-foreground font-accent">
        الصف {slot.grade} - الشعبة {slot.section}
      </div>
    </button>
  );
}
