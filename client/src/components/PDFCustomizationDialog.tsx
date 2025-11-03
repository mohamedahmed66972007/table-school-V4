
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AVAILABLE_ARABIC_FONTS, type PDFCustomizationOptions, DEFAULT_PDF_OPTIONS } from "@/types/pdfCustomization";
import { FileUp, Download, Palette, X, Type } from "lucide-react";

interface PDFCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: PDFCustomizationOptions) => Promise<void>;
  title: string;
}

export function PDFCustomizationDialog({
  open,
  onOpenChange,
  onExport,
  title,
}: PDFCustomizationDialogProps) {
  const [options, setOptions] = useState<PDFCustomizationOptions>(DEFAULT_PDF_OPTIONS);
  const [useSameFont, setUseSameFont] = useState(true);
  const [customColor, setCustomColor] = useState("#428bca");
  const [isExporting, setIsExporting] = useState(false);

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    const rgb = hexToRgb(color);
    setOptions({ ...options, themeColor: rgb });
  };

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, fontType: 'header' | 'content' | 'day') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1];
      const fontName = file.name.replace('.ttf', '');
      
      if (fontType === 'header') {
        setOptions({ 
          ...options, 
          useCustomHeaderFont: true, 
          customHeaderFont: { name: fontName, base64Data }
        });
      } else if (fontType === 'content') {
        setOptions({ 
          ...options, 
          useCustomContentFont: true, 
          customContentFont: { name: fontName, base64Data }
        });
      } else if (fontType === 'day') {
        setOptions({ 
          ...options, 
          useCustomDayFont: true, 
          customDayFont: { name: fontName, base64Data }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(options);
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">التخصيص العام</TabsTrigger>
            <TabsTrigger value="fonts">الخطوط والأحجام</TabsTrigger>
            <TabsTrigger value="preview">معاينة</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" />
                لون خلفية الرأس
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-20 h-12 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    اختر اللون المناسب لخلفية رأس الجدول
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    اللون الحالي: {customColor}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 border rounded-lg p-4">
                <Label className="font-semibold">لون نص عناوين الحصص</Label>
                <p className="text-xs text-muted-foreground mb-2">الحصة 1، الحصة 2...</p>
                <Input
                  type="color"
                  value={rgbToHex(options.headerTextColor)}
                  onChange={(e) => setOptions({ ...options, headerTextColor: hexToRgb(e.target.value) })}
                  className="w-full h-10 cursor-pointer"
                />
              </div>

              <div className="space-y-2 border rounded-lg p-4">
                <Label className="font-semibold">لون نص الأيام</Label>
                <p className="text-xs text-muted-foreground mb-2">الأحد، الاثنين...</p>
                <Input
                  type="color"
                  value={rgbToHex(options.dayTextColor)}
                  onChange={(e) => setOptions({ ...options, dayTextColor: hexToRgb(e.target.value) })}
                  className="w-full h-10 cursor-pointer"
                />
              </div>

              <div className="space-y-2 border rounded-lg p-4">
                <Label className="font-semibold">لون نص المحتوى</Label>
                <p className="text-xs text-muted-foreground mb-2">المواد والبيانات</p>
                <Input
                  type="color"
                  value={rgbToHex(options.contentTextColor)}
                  onChange={(e) => setOptions({ ...options, contentTextColor: hexToRgb(e.target.value) })}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold mb-3">معاينة الألوان</h3>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"]
                  .map((day) => (
                    <div
                      key={day}
                      className="text-center p-2 rounded text-white text-sm"
                      style={{ backgroundColor: customColor }}
                    >
                      {day}
                    </div>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2 border rounded-lg p-4">
                <Label className="font-semibold">حجم خط العناوين</Label>
                <p className="text-xs text-muted-foreground mb-2">الحصة 1، الحصة 2...</p>
                <Input
                  type="number"
                  min="8"
                  max="24"
                  value={options.headerFontSize}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    headerFontSize: parseInt(e.target.value) || 16 
                  })}
                />
              </div>

              <div className="space-y-2 border rounded-lg p-4">
                <Label className="font-semibold">حجم خط الأيام</Label>
                <p className="text-xs text-muted-foreground mb-2">الأحد، الاثنين...</p>
                <Input
                  type="number"
                  min="8"
                  max="24"
                  value={options.dayFontSize}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    dayFontSize: parseInt(e.target.value) || 13 
                  })}
                />
              </div>

              <div className="space-y-2 border rounded-lg p-4">
                <Label className="font-semibold">حجم خط المحتوى</Label>
                <p className="text-xs text-muted-foreground mb-2">المواد والبيانات</p>
                <Input
                  type="number"
                  min="8"
                  max="24"
                  value={options.contentFontSize}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    contentFontSize: parseInt(e.target.value) || 11 
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fonts" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="same-font" className="text-base">
                استخدام نفس الخط للجدول بالكامل
              </Label>
              <Switch
                id="same-font"
                checked={useSameFont}
                onCheckedChange={setUseSameFont}
              />
            </div>

            {useSameFont ? (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="space-y-3">
                  <Label>خط الجدول</Label>
                  <Select
                    value={options.headerFont}
                    onValueChange={(value) =>
                      setOptions({ 
                        ...options, 
                        headerFont: value, 
                        contentFont: value,
                        dayFont: value,
                        useCustomHeaderFont: false,
                        useCustomContentFont: false,
                        useCustomDayFont: false
                      })
                    }
                    disabled={options.useCustomHeaderFont}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الخط" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ARABIC_FONTS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>حجم خط العناوين</Label>
                    <Input
                      type="number"
                      min="8"
                      max="24"
                      value={options.headerFontSize}
                      onChange={(e) => setOptions({ 
                        ...options, 
                        headerFontSize: parseInt(e.target.value) || 16 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>حجم خط الأيام</Label>
                    <Input
                      type="number"
                      min="8"
                      max="24"
                      value={options.dayFontSize}
                      onChange={(e) => setOptions({ 
                        ...options, 
                        dayFontSize: parseInt(e.target.value) || 13 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>حجم خط المحتوى</Label>
                    <Input
                      type="number"
                      min="8"
                      max="24"
                      value={options.contentFontSize}
                      onChange={(e) => setOptions({ 
                        ...options, 
                        contentFontSize: parseInt(e.target.value) || 11 
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    رفع خط مخصص (TTF)
                  </Label>
                  <Input
                    type="file"
                    accept=".ttf"
                    onChange={(e) => {
                      handleCustomFontUpload(e, 'header');
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          const base64Data = base64.split(",")[1];
                          const fontName = file.name.replace('.ttf', '');
                          setOptions({ 
                            ...options, 
                            useCustomHeaderFont: true,
                            useCustomContentFont: true,
                            useCustomDayFont: true,
                            customHeaderFont: { name: fontName, base64Data },
                            customContentFont: { name: fontName, base64Data },
                            customDayFont: { name: fontName, base64Data }
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {options.useCustomHeaderFont && options.customHeaderFont && (
                    <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      <span>تم تحميل الخط: {options.customHeaderFont.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOptions({ 
                          ...options, 
                          useCustomHeaderFont: false,
                          useCustomContentFont: false,
                          useCustomDayFont: false,
                          customHeaderFont: undefined,
                          customContentFont: undefined,
                          customDayFont: undefined
                        })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* خط عناوين الحصص */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    خط عناوين الحصص (الحصة 1، الحصة 2...)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الخط</Label>
                      <Select
                        value={options.headerFont}
                        onValueChange={(value) =>
                          setOptions({ ...options, headerFont: value, useCustomHeaderFont: false })
                        }
                        disabled={options.useCustomHeaderFont}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الخط" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ARABIC_FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>حجم الخط</Label>
                      <Input
                        type="number"
                        min="8"
                        max="24"
                        value={options.headerFontSize}
                        onChange={(e) => setOptions({ 
                          ...options, 
                          headerFontSize: parseInt(e.target.value) || 16 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <FileUp className="h-3 w-3" />
                      رفع خط مخصص للعناوين
                    </Label>
                    <Input
                      type="file"
                      accept=".ttf"
                      onChange={(e) => handleCustomFontUpload(e, 'header')}
                      className="cursor-pointer text-sm"
                    />
                    {options.useCustomHeaderFont && options.customHeaderFont && (
                      <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>{options.customHeaderFont.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOptions({ 
                            ...options, 
                            useCustomHeaderFont: false, 
                            customHeaderFont: undefined 
                          })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* خط الأيام */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    خط الأيام (الأحد، الاثنين...)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الخط</Label>
                      <Select
                        value={options.dayFont}
                        onValueChange={(value) =>
                          setOptions({ ...options, dayFont: value, useCustomDayFont: false })
                        }
                        disabled={options.useCustomDayFont}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الخط" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ARABIC_FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>حجم الخط</Label>
                      <Input
                        type="number"
                        min="8"
                        max="24"
                        value={options.dayFontSize}
                        onChange={(e) => setOptions({ 
                          ...options, 
                          dayFontSize: parseInt(e.target.value) || 13 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <FileUp className="h-3 w-3" />
                      رفع خط مخصص للأيام
                    </Label>
                    <Input
                      type="file"
                      accept=".ttf"
                      onChange={(e) => handleCustomFontUpload(e, 'day')}
                      className="cursor-pointer text-sm"
                    />
                    {options.useCustomDayFont && options.customDayFont && (
                      <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>{options.customDayFont.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOptions({ 
                            ...options, 
                            useCustomDayFont: false, 
                            customDayFont: undefined 
                          })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* خط المحتوى */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    خط المحتوى (المواد والبيانات)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الخط</Label>
                      <Select
                        value={options.contentFont}
                        onValueChange={(value) =>
                          setOptions({ ...options, contentFont: value, useCustomContentFont: false })
                        }
                        disabled={options.useCustomContentFont}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الخط" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ARABIC_FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>حجم الخط</Label>
                      <Input
                        type="number"
                        min="8"
                        max="24"
                        value={options.contentFontSize}
                        onChange={(e) => setOptions({ 
                          ...options, 
                          contentFontSize: parseInt(e.target.value) || 11 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <FileUp className="h-3 w-3" />
                      رفع خط مخصص للمحتوى
                    </Label>
                    <Input
                      type="file"
                      accept=".ttf"
                      onChange={(e) => handleCustomFontUpload(e, 'content')}
                      className="cursor-pointer text-sm"
                    />
                    {options.useCustomContentFont && options.customContentFont && (
                      <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>{options.customContentFont.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOptions({ 
                            ...options, 
                            useCustomContentFont: false, 
                            customContentFont: undefined 
                          })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-900" dir="rtl">
              <h3 className="text-center mb-4 font-bold text-xl" style={{ 
                fontSize: `${options.headerFontSize}px`,
                color: rgbToHex(options.headerTextColor)
              }}>
                جدول حصص الصف 12/7
              </h3>
              <p className="text-center mb-6" style={{
                fontSize: `${options.contentFontSize}px`,
                color: rgbToHex(options.contentTextColor)
              }}>
                العام الدراسي 2025-2026
              </p>

              <div className="overflow-x-auto" dir="rtl">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 text-white text-right" style={{ 
                        backgroundColor: customColor,
                        fontSize: `${options.dayFontSize}px`
                      }}>
                        اليوم
                      </th>
                      {[1, 2, 3, 4, 5, 6, 7].map(p => (
                        <th key={p} className="border p-3 text-white" style={{ 
                          backgroundColor: customColor,
                          fontSize: `${options.headerFontSize}px`
                        }}>
                          الحصة {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["الأحد", "الاثنين", "الثلاثاء"].map((day, idx) => (
                      <tr key={day}>
                        <td className="border p-3 font-semibold text-right" style={{
                          fontSize: `${options.dayFontSize}px`,
                          color: rgbToHex(options.dayTextColor)
                        }}>
                          {day}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7].map(p => (
                          <td key={p} className="border p-3 text-center" style={{
                            fontSize: `${options.contentFontSize}px`,
                            color: rgbToHex(options.contentTextColor)
                          }}>
                            {idx === 0 && p === 1 ? "رياضيات" : idx === 1 && p === 2 ? "فيزياء" : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-center" style={{
                fontSize: `${options.contentFontSize - 2}px`,
                color: rgbToHex(options.contentTextColor)
              }}>
                معاينة تقريبية للجدول - الألوان والخطوط والأحجام
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "جاري التصدير..." : "تصدير PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function rgbToHex(rgb: [number, number, number]): string {
  return "#" + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}
