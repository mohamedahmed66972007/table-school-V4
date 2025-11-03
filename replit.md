# نظام جدولة الحصص المدرسية

## نظرة عامة
تطبيق ويب عربي لإدارة جداول الحصص المدرسية. يسمح للمعلمين بإنشاء جداولهم الفردية، ويولد النظام تلقائياً جداول الصفوف بناءً على مدخلات المعلمين.

## الميزات الرئيسية
- **إدارة المعلمين**: إضافة، تعديل، وحذف المعلمين
- **جدولة الحصص**: 7 حصص × 5 أيام (الأحد-الخميس)
- **الصفوف**: الصفوف 10-12
- **الشعب**: الشعب 1-8
- **المواد**: 10 مواد دراسية (عربي، إنجليزي، رياضيات، كيمياء، فيزياء، أحياء، إسلامية وقرآن، اجتماعيات، جيولوجيا، دستور)
- **تصدير PDF**: 
  - جدول معلم فردي
  - جميع جداول المعلمين
  - جدول صف فردي
  - جميع جداول الصفوف (10/1 - 12/8)
- **عرض الجداول**: مع/بدون أسماء المعلمين
- **الواجهة**: RTL كامل، ثيم داكن، رسوم متحركة سلسة، خطوط عربية متعددة

## البنية التقنية

### Backend
- **Framework**: Express.js
- **التخزين**: In-memory (MemStorage)
- **API**: RESTful endpoints لجميع عمليات CRUD
- **المنفذ**: 5000 (frontend و backend على نفس المنفذ)
- **المضيف**: 0.0.0.0

### Frontend
- **Framework**: React + TypeScript + Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (v5)
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **PDF**: jsPDF + jsPDF-autotable
- **Dev Server**: Vite integrated with Express

### الملفات الرئيسية
- `shared/schema.ts`: تعريفات الأنواع والثوابت وجداول Drizzle
- `server/storage.ts`: واجهة التخزين وتنفيذ MemStorage
- `server/routes.ts`: API routes
- `server/index.ts`: Express server setup
- `server/vite.ts`: Vite dev server integration
- `client/src/lib/pdfGenerator.ts`: منطق تصدير PDF
- `client/src/pages/Home.tsx`: الصفحة الرئيسية
- `client/src/pages/Teachers.tsx`: إدارة المعلمين
- `client/src/pages/TeacherSchedule.tsx`: تعديل جدول معلم
- `client/src/pages/Classes.tsx`: عرض جداول الصفوف
- `vite.config.ts`: إعدادات Vite مع دعم Replit proxy

## API Endpoints

### المعلمون
- `GET /api/teachers` - جميع المعلمين
- `GET /api/teachers/:id` - معلم واحد
- `POST /api/teachers` - إنشاء معلم
- `PUT /api/teachers/:id` - تحديث معلم
- `DELETE /api/teachers/:id` - حذف معلم

### الحصص
- `GET /api/schedule-slots` - جميع الحصص
- `GET /api/teachers/:id/schedule-slots` - حصص معلم
- `POST /api/teachers/:id/schedule-slots/batch` - حفظ جدول معلم كامل
- `GET /api/class-schedules/:grade/:section` - جدول صف محدد

## معلومات مهمة
- **staleTime**: Infinity في queryClient - يتطلب invalidation يدوي دقيق للذاكرة المؤقتة
- **Cache Invalidation**: عند حفظ/حذف جدول معلم، يتم invalidate جميع جداول الصفوف التي تعتمد عليه
- **التحديثات التلقائية**: جداول الصفوف تتولد تلقائياً من جداول المعلمين

## التشغيل

### بيئة التطوير
```bash
npm install  # تثبيت المكتبات
npm run dev  # تشغيل الخادم
```
الخادم يعمل على المنفذ 5000 (يشمل API و Frontend)

### بيئة الإنتاج
```bash
npm run build  # بناء المشروع
npm run start  # تشغيل النسخة المنتجة
```

### النشر (Deployment)
تم إعداد التطبيق للنشر على Replit:
- **نوع النشر**: Autoscale (للتطبيقات الثابتة stateless)
- **البناء**: `npm run build`
- **التشغيل**: `npm run start`

## إعدادات Replit المهمة
- تم تكوين Vite لقبول جميع المضيفين (allowedHosts: true) للعمل مع Replit proxy
- HMR (Hot Module Replacement) يعمل عبر منفذ 443
- الخادم يعمل على 0.0.0.0:5000
