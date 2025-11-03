import { Card } from "./ui/card";
import { DAYS, PERIODS } from "@shared/schema";
import ScheduleCell from "./ScheduleCell";
import type { ScheduleSlotData } from "@/types/schedule";

export type { ScheduleSlotData };

interface ScheduleGridProps {
  slots: ScheduleSlotData[];
  onSlotClick: (day: string, period: number) => void;
  readOnly?: boolean;
}

export default function ScheduleGrid({ slots, onSlotClick, readOnly = false }: ScheduleGridProps) {
  const getSlot = (day: string, period: number) => {
    return slots?.find((s) => s.day === day && s.period === period);
  };

  return (
    <Card className="p-6 overflow-x-auto">
      <div className="min-w-[800px]" dir="rtl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-right font-heading text-sm border border-border bg-muted/50 w-32">
                اليوم / الحصة
              </th>
              {PERIODS.map((period) => (
                <th
                  key={period}
                  className="p-3 text-center font-heading text-sm border border-border bg-muted/50 font-data w-28"
                >
                  الحصة {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td className="p-3 font-semibold border border-border bg-muted/30 font-heading w-32">
                  {day}
                </td>
                {PERIODS.map((period) => {
                  const slot = getSlot(day, period);
                  return (
                    <td key={`${day}-${period}`} className="border border-border p-0 w-28 h-20">
                      <ScheduleCell
                        slot={slot}
                        onClick={() => !readOnly && onSlotClick(day, period)}
                        readOnly={readOnly}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
