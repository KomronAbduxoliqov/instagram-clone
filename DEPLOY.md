# Loyihani Ommaga Taqdim Etish (Deploy) Bo'yicha Qo'llanma

Tabriklayman! Instagram kloningiz ishga tayyor. Uni internetga chiqarish (deploy qilish) uchun quyidagi bepul va mashhur usuldan foydalanishni tavsiya qilaman: **Frontend uchun Vercel**, **Backend va Ma'lumotlar bazasi (DB) uchun Render**.

Men loyihangizga kerakli bo'lgan barcha deploy konfiguratsiyalarini (`render.yaml` va `vercel.json`) qo'shdim. Buni ishga tushirish uchun quyidagi bosqichlarni bajaring:

## 1-Bosqich: Loyihani GitHub'ga yuklash
Barcha o'zgarishlarni GitHub ga `push` qiling:
```bash
git add .
git commit -m "Deploy uchun tayyorgarlik"
git push origin main
```

## 2-Bosqich: Backend va DB'ni Render.com ga joylash
1. [Render.com](https://render.com) saytiga kiring va GitHub orqali ro'yxatdan o'ting.
2. Yangi (New) menyusidan **"Blueprint"** ni tanlang.
3. O'zingizning Instagram klon repozitoriyangizni tanlang.
4. Render loyiha ichidagi `render.yaml` faylini avtomatik o'qib, bitta **PostgreSQL ma'lumotlar bazasi** va bitta **Node.js Web Service** yaratadi.
5. So'ngra, Render'dagi PostgreSQL sahifasiga kirib "External Database URL" ni nusxalang va kompyuteringizdan (yoki DBeaver/pgAdmin orqali) unga ulanib loyihadagi `backend/schema.sql` fayli ichidagi buyruqlarni ishga tushiring (jadvallarni yaratish uchun).
6. Web Service ishga tushgach, uning manzilini nusxalab oling (masalan: `https://instagram-backend-xxx.onrender.com`).

## 3-Bosqich: Frontend'ni Vercel.com ga joylash
1. [Vercel.com](https://vercel.com) saytiga kiring va GitHub orqali ro'yxatdan o'ting.
2. **"Add New Project"** tugmasini bosing va repozitoriyangizni tanlang.
3. **Framework Preset** sifatida `Vite` o'zi tanlanadi. Root directory ni `frontend` deb ko'rsating.
4. **Environment Variables** (Muhit o'zgaruvchilari) bo'limiga quyidagini qo'shing:
   - Name: `VITE_API_URL`
   - Value: `https://instagram-backend-xxx.onrender.com` (2-bosqichda nusxalagan manzilingiz).
5. **Deploy** tugmasini bosing. 

## 4-Bosqich: So'nggi ulanish (CORS)
Vercel loyihangizni internetga chiqargandan so'ng sizga domen beradi (masalan: `https://instagram-clone.vercel.app`).
1. Endi qaytib Render.com dagi **Web Service** muhit o'zgaruvchilari (Environment) bo'limiga kiring.
2. `CLIENT_URL` degan o'zgaruvchining qiymatini Vercel bergan URL ga almashtiring (`https://instagram-clone.vercel.app`).
3. Serverni bir marta qayta ishga tushiring (Manual Deploy -> Clear build cache & deploy).

**Tayyor! Loyihangiz 100% ishlab butun dunyoga ko'rinadi!** 🚀

*Eslatma: Renderning bepul versiyasida rasm va videolar server qayta yuklanganda o'chib ketadi. Haqiqiy proyekt uchun keyinchalik rasmlarni AWS S3 yoki Cloudinary kabi xizmatlarga saqlashni sozlash kerak bo'ladi.*
