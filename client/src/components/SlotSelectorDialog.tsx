import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { GRADES, SECTIONS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SlotSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (grade: number, section: number) => void;
  day: string;
  period: number;
  initialGrade?: number;
  initialSection?: number;
  existingSlots?: Array<{ grade: number; section: number; day: string; period: number }>;
  currentSlot?: { day: string; period: number };
}

export default function SlotSelectorDialog({
  open,
  onClose,
  onSave,
  day,
  period,
  initialGrade,
  initialSection,
  existingSlots = [],
  currentSlot,
}: SlotSelectorDialogProps) {
  const [grade, setGrade] = useState<string>(initialGrade?.toString() || "");
  const [section, setSection] = useState<string>(initialSection?.toString() || "");
  const { toast } = useToast();

  const handleSave = () => {
    if (grade && section) {
      // Check for conflict
      const hasConflict = existingSlots.some(
        slot =>
          slot.grade === parseInt(grade) &&
          slot.section === parseInt(section) &&
          currentSlot &&
          slot.day === currentSlot.day &&
          slot.period === currentSlot.period
      );

      if (hasConflict) {
        toast({
          title: "تعارض في الجدول",
          description: `يوجد بالفعل حصة للصف ${grade}/${section} في ${currentSlot?.day} الحصة ${currentSlot?.period}`,
          variant: "destructive",
        });
        return;
      }

      onSave(parseInt(grade), parseInt(section));
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            اختيار الصف والشعبة
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-body">
            {day} - الحصة {period}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade" className="font-accent">
              الصف
            </Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade" data-testid="select-grade">
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g.toString()}>
                    الصف {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section" className="font-accent">
              الشعبة
            </Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger id="section" data-testid="select-section">
                <SelectValue placeholder="اختر الشعبة" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    الشعبة {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={!grade || !section}
            data-testid="button-save-slot"
          >
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}