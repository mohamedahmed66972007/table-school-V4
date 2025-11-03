
export interface CustomFontUpload {
  name: string;
  base64Data: string;
}

export interface PDFCustomizationOptions {
  themeColor: [number, number, number];
  headerFont: string;
  headerFontSize: number;
  headerTextColor: [number, number, number];
  contentFont: string;
  contentFontSize: number;
  contentTextColor: [number, number, number];
  dayFont: string;
  dayFontSize: number;
  dayTextColor: [number, number, number];
  useCustomHeaderFont: boolean;
  useCustomContentFont: boolean;
  useCustomDayFont: boolean;
  customHeaderFont?: CustomFontUpload;
  customContentFont?: CustomFontUpload;
  customDayFont?: CustomFontUpload;
}

export const DEFAULT_PDF_OPTIONS: PDFCustomizationOptions = {
  themeColor: [66, 139, 202],
  headerFont: "Vazirmatn",
  headerFontSize: 16,
  headerTextColor: [0, 0, 0],
  contentFont: "Vazirmatn",
  contentFontSize: 11,
  contentTextColor: [0, 0, 0],
  dayFont: "Vazirmatn",
  dayFontSize: 13,
  dayTextColor: [0, 0, 0],
  useCustomHeaderFont: false,
  useCustomContentFont: false,
  useCustomDayFont: false,
};

export const AVAILABLE_ARABIC_FONTS = [
  { value: "Vazirmatn", label: "Vazirmatn", url: "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf" },
  { value: "Cairo", label: "Cairo - كايرو", url: "https://arbfonts.com//wp-content/fonts/new-arabic-fonts//Cairo-Regular.ttf" },
  { value: "Amiri", label: "Amiri - أميري", url: "https://arbfonts.com/font_files/new//Amiri.ttf" },
  { value: "Tajawal", label: "Tajawal - تجول", url: "https://arbfonts.com/font_files/new//Amiri.ttf" },
  { value: "Almarai", label: "Almarai - المرعي", url: "https://arbfonts.com//wp-content/fonts/naskh-arabic-fonts//Almarai-Regular.ttf" },
  { value: "Markazi", label: "Graphic School Regular - جرافيك سكول", url: "https://arbfonts.com//wp-content/fonts/arabic-fonts-wierd//GraphicSchool-Regular.ttf" },
  { value: "ReemKufi", label: "Reem Kufi - ريم كوفي", url: "https://fonts.gstatic.com/s/reemkufi/v21/2sDPZGJLip7W2J7v7wQZZE1I0yCmYzzQtuZnEGGf3qGuvM4.ttf" },
] as const;
