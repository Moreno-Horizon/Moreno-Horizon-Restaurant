# دليل النقل الشامل للمشروع (GitHub, Firebase, Vercel)

هذا الدليل يوضح لك خطوة بخطوة كيف تقوم برفع مشروعك من الصفر باستخدام **حساب جيميل جديد كلياً**.

---

## 🛠️ المرحلة الأولى: إنشاء الحسابات الأساسية

1. **إنشاء حساب Gmail جديد:**
   * اذهب إلى [Gmail.com](https://gmail.com) وقم بإنشاء حساب جديد باسم المشروع (مثلاً: `moreno.horizon@gmail.com`).
   * ابقَ مسجلاً الدخول بهذا الحساب في متصفحك.

2. **إنشاء حساب GitHub:**
   * اذهب إلى [GitHub.com](https://github.com) واضغط على **Sign up**.
   * استخدم الإيميل الجديد للتسجيل، وقم بتأكيد الحساب من الرسالة التي ستصلك على الإيميل.

---

## ☁️ المرحلة الثانية: إعداد قاعدة البيانات (Firebase)

بما أن المشروع يعتمد على Firebase لحفظ الحجوزات، يجب إنشاء قاعدة بيانات جديدة.

1. **إنشاء المشروع:**
   * اذهب إلى [Firebase Console](https://console.firebase.google.com/) وسجل دخولك بالجيميل الجديد.
   * اضغط على **Create a project** (إنشاء مشروع).
   * سَمِّ المشروع `moreno-horizon` واضغط Continue.
   * لا داعي لتفعيل Google Analytics الآن، يمكنك إيقافه ثم الضغط على **Create project**.

2. **تفعيل الـ Firestore (قاعدة البيانات):**
   * من القائمة الجانبية في لوحة تحكم Firebase، اختر **Firestore Database**.
   * اضغط على **Create database**.
   * في شاشة **Select edition**، اختر **Standard edition** (النسخة المجانية/القياسية) ثم اضغط **Next**.
   * في شاشة **Database ID & location**، اختر موقع السيرفر الأقرب (مثلاً `eur3 (Europe)` أو `us-central`) واضغط **Next**.
   * في شاشة **Configure**، اختر **Start in production mode** (البدء في وضع الإنتاج) واضغط **Create**.

3. **إعداد قواعد الأمان (Security Rules):**
   * في صفحة الـ Firestore، اذهب إلى تبويب **Rules**.
   * امسح الكود الموجود وضع الكود التالي بدلاً منه:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /bookings/{document=**} {
           allow read, write: if true;
         }
         match /settings/{document=**} {
           allow read: if true;
           allow write: if true;
         }
         match /users/{document=**} {
           allow read: if true;
           allow write: if true;
         }
       }
     }
     ```
   * اضغط **Publish**. *(ملاحظة: هذه القواعد مفتوحة مؤقتاً لتسهيل التشغيل، سيتم تأمينها لاحقاً)*.

4. **ربط Firebase بالكود الخاص بك:**
   * ارجع إلى الصفحة الرئيسية في Firebase Project Settings.
   * اضغط على علامة `</>` (Web App) لإضافة تطبيق جديد.
   * سَمِّ التطبيق `moreno-web` واضغط **Register app**.
   * سيظهر لك كود يحتوي على إعدادات (Config)، انسخ المتغيرات الموجودة بداخله.
   * اذهب إلى الكود الخاص بك، وافتح ملف `.env.local`، وضع القيم الجديدة هكذا:
     ```env
     VITE_FIREBASE_API_KEY="أدخل_الكود_الجديد_هنا"
     VITE_FIREBASE_AUTH_DOMAIN="أدخل_الكود_الجديد_هنا"
     VITE_FIREBASE_PROJECT_ID="أدخل_الكود_الجديد_هنا"
     VITE_FIREBASE_STORAGE_BUCKET="أدخل_الكود_الجديد_هنا"
     VITE_FIREBASE_MESSAGING_SENDER_ID="أدخل_الكود_الجديد_هنا"
     VITE_FIREBASE_APP_ID="أدخل_الكود_الجديد_هنا"
     ```

---

## 💻 المرحلة الثالثة: رفع الكود إلى GitHub

1. **إنشاء مستودع (Repository) في جيت هاب:**
   * في حسابك الجديد على GitHub، اضغط على زر `+` ثم **New repository**.
   * اكتب اسم المستودع `moreno-booking-system`.
   * اجعله **Private** (خاص) أو **Public** (عام) حسب رغبتك.
   * **لا تقم بتحديد** (Add a README file)، ثم اضغط **Create repository**.

2. **رفع الكود من جهازك إلى GitHub:**
   * افتح الـ Terminal في برنامج VS Code الخاص بمشروعك (تأكد أنك أوقفت السيرفر `Ctrl+C`).
   * بما أن المشروع مرفوع سابقاً على جيت هاب قديم، يجب عليك أولاً فك الارتباط القديم وربطه بالجديد. اكتب الأوامر التالية بالترتيب:
     ```bash
     git remote remove origin
     git add .
     git commit -m "Migration to new infrastructure"
     ```
   * ثم انسخ أمر الربط من صفحة جيت هاب الجديدة، وسيكون شكله هكذا تقريباً:
     ```bash
     git remote add origin https://github.com/YourNewUsername/moreno-booking-system.git
     ```
   * ثم قم بالرفع:
     ```bash
     git push -u origin master
     ```
     *(سيطلب منك تسجيل الدخول لحساب جيت هاب لربط الكود، قم بإدخال بيانات الحساب الجديد)*.

---

## 🚀 المرحلة الرابعة: الاستضافة على Vercel

1. **تسجيل الدخول وربط الحساب:**
   * اذهب إلى [Vercel.com](https://vercel.com) واضغط على **Sign Up**.
   * اختر التسجيل باستخدام **Continue with GitHub**.
   * سيتعرف Vercel فوراً على حسابك الجديد في جيت هاب، وافق على الصلاحيات.

2. **استضافة المشروع (Deploy):**
   * في لوحة تحكم Vercel، اضغط على زر **Add New...** ثم اختر **Project**.
   * ستجد مستودع `moreno-booking-system` الذي رفعته في المرحلة السابقة، اضغط بجانبه على زر **Import**.
   * في قسم **Environment Variables** (أهم خطوة):
     * قم بفتح ملف `.env.local` في جهازك.
     * انسخ كل سطر (اسم المتغير وقيمته) وأضفه في Vercel. (مثلاً Name: `VITE_FIREBASE_API_KEY` و Value: قيمتها).
     * كرر العملية لكل المتغيرات الـ 6 الخاصة بـ Firebase ورابط الـ Google Script (إن وجد).
   * أخيرًا، اضغط على زر **Deploy**.

انتظر حوالي دقيقتين، وسيقوم Vercel ببناء المشروع ونشره وإعطائك الرابط النهائي المباشر للموقع. مبارك! موقعك الآن يعمل على حسابات جديدة ومستقلة بالكامل.
