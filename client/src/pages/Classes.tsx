import { useState } from "react";
import { FileDown, Eye, EyeOff, Edit3, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClassScheduleTable from "@/components/ClassScheduleTable";
import { EditableClassSchedule } from "@/components/EditableClassSchedule";
import { PDFCustomizationDialog } from "@/components/PDFCustomizationDialog";
import { ScheduleAssistant } from "@/components/ScheduleAssistant";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { ClassScheduleSlot } from "@/components/ClassScheduleTable";
import type { Teacher, ScheduleSlot } from "@shared/schema";
import { GRADES, SECTIONS } from "@shared/schema";
import { exportClassSchedulePDF, exportAllClassesPDF } from "@/lib/pdfGenerator";
import type { PDFCustomizationOptions } from "@/types/pdfCustomization";

export default function Classes() {
  const [selectedGrade, setSelectedGrade] = useState<string>("10");
  const [selectedSection, setSelectedSection] = useState<string>("1");
  const [showTeacherNames, setShowTeacherNames] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfExportType, setPdfExportType] = useState<"single" | "all">("single");
  const { toast } = useToast();

  const { data: classSchedule = [], isLoading } = useQuery<ClassScheduleSlot[]>({
    queryKey: [`/api/class-schedules/${selectedGrade}/${selectedSection}`],
  });

  const { data: allSlots = [] } = useQuery<ScheduleSlot[]>({
    queryKey: ["/api/schedule-slots"],
  });

  const { data: allTeachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const handleExportPDF = async (options: PDFCustomizationOptions) => {
    try {
      if (pdfExportType === "single") {
        await exportClassSchedulePDF(
          parseInt(selectedGrade),
          parseInt(selectedSection),
          classSchedule,
          showTeacherNames,
          options
        );
        toast({
          title: "تم التصدير",
          description: `تم تصدير جدول الصف ${selectedGrade}/${selectedSection} بنجاح`,
        });
      } else {
        await exportAllClassesPDF(allSlots, allTeachers, showTeacherNames, options);
        toast({
          title: "تم التصدير",
          description: "تم تصدير جداول جميع الصفوف بنجاح (10/1 - 12/8)",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير PDF",
        variant: "destructive",
      });
    }
  };

  const openPDFDialog = (type: "single" | "all") => {
    setPdfExportType(type);
    setPdfDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading">جداول الصفوف</h1>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => openPDFDialog("all")}
                className="gap-2"
                data-testid="button-export-all-classes"
              >
                <FileDown className="h-4 w-4" />
                تصدير جميع الجداول PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => openPDFDialog("single")}
                disabled={classSchedule.length === 0}
                className="gap-2"
                data-testid="button-export-current"
              >
                <FileDown className="h-4 w-4" />
                تصدير الجدول الحالي
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-card-border">
            <div className="flex items-center gap-3">
              <Label htmlFor="grade" className="font-accent whitespace-nowrap">
                الصف:
              </Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger
                  id="grade"
                  className="w-32"
                  data-testid="select-class-grade"
                >
                  <SelectValue />
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

            <div className="flex items-center gap-3">
              <Label htmlFor="section" className="font-accent whitespace-nowrap">
                الشعبة:
              </Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger
                  id="section"
                  className="w-32"
                  data-testid="select-class-section"
                >
                  <SelectValue />
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

            <div className="flex items-center gap-2">
              <Switch
                id="edit-mode"
                checked={editMode}
                onCheckedChange={setEditMode}
              />
              <Label htmlFor="edit-mode" className="font-accent cursor-pointer">
                {editMode ? (
                  <span className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    وضع التعديل
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    وضع القراءة
                  </span>
                )}
              </Label>
            </div>

            {!editMode && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-teachers"
                  checked={showTeacherNames}
                  onCheckedChange={setShowTeacherNames}
                  data-testid="switch-show-teachers"
                />
                <Label htmlFor="show-teachers" className="font-accent cursor-pointer">
                  {showTeacherNames ? (
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      عرض أسماء المعلمين
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      إخفاء أسماء المعلمين
                    </span>
                  )}
                </Label>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : editMode ? (
            <EditableClassSchedule
              grade={parseInt(selectedGrade)}
              section={parseInt(selectedSection)}
              slots={allSlots.filter(
                (s) =>
                  s.grade === parseInt(selectedGrade) &&
                  s.section === parseInt(selectedSection)
              )}
              allSlots={allSlots}
              allTeachers={allTeachers}
            />
          ) : (
            <ClassScheduleTable
              grade={parseInt(selectedGrade)}
              section={parseInt(selectedSection)}
              slots={classSchedule}
              showTeacherNames={showTeacherNames}
            />
          )}
        </div>
      </div>

      <PDFCustomizationDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        onExport={handleExportPDF}
        title={
          pdfExportType === "single"
            ? `تصدير جدول الصف ${selectedGrade}/${selectedSection}`
            : "تصدير جميع جداول الصفوف"
        }
      />

      <div className="fixed bottom-4 left-4 z-50">
        <ScheduleAssistant allSlots={allSlots} />
      </div>
    </div>
  );
}