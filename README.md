# Instagram Clone

To'liq funksional Instagram klon loyihasi — feed, stories, izohlar, layklar, follow tizimi, real-time direct messages va bildirishnomalar bilan.

## Texnologiyalar

**Frontend:** React + TypeScript + Vite + Tailwind CSS v4 + Zustand + TanStack Query + Framer Motion + Socket.io-client
**Backend:** Express 5 + TypeScript + PostgreSQL + JWT + Socket.io + Multer

## Funksiyalar

- Ro'yxatdan o'tish / kirish (JWT + httpOnly cookie)
- Post yaratish (bir nechta rasm/video, carousel)
- Feed (follow qilingan userlarning postlari)
- Explore sahifasi (grid, eng ko'p layk olganlar)
- Like, comment (reply bilan), saqlash (bookmark)
- Follow/unfollow, shaxsiy (private) hisoblar
- Stories (24 soatdan keyin avtomatik o'chadi, ko'rganlar ro'yxati)
- Real-time Direct Messages (Socket.io)
- Bildirishnomalar (like, comment, follow)
- Foydalanuvchi qidiruvi
- Profilni tahrirlash (avatar, bio, ism)

## O'rnatish

### 1. Talablar

- Node.js 18+
- PostgreSQL 14+ (kompyuteringizda o'rnatilgan bo'lishi kerak)

### 2. Ma'lumotlar bazasini yaratish

PowerShell yoki terminalda:

```bash
psql -U postgres
```

PostgreSQL ichida:

```sql
CREATE DATABASE instagram_clone;
\q
```

Keyin sxemani yuklang:

```bash
psql -U postgres -d instagram_clone -f backend/src/db/schema.sql
```

### 3. Backend sozlash

```bash
cd backend
npm install
```

`.env.example` faylidan nusxa oling va `.env` deb nomlang:

```bash
cp .env.example .env
```

`.env` faylini oching va quyidagilarni to'ldiring:
- `DATABASE_URL` — PostgreSQL parolingiz bilan
- `JWT_SECRET` — istalgan uzun, tasodifiy matn

Backendni ishga tushirish:

```bash
npm run dev
```

Server `http://localhost:5000` da ishga tushadi.

### 4. Frontend sozlash

Yangi terminal oynasida:

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` da ishga tushadi va backend'ga avtomatik proxy qiladi.

### 5. Foydalanish

Brauzerda `http://localhost:3000` ni oching, ro'yxatdan o'ting va boshlang!

## Loyiha strukturasi

```
instagram-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Biznes-logika (auth, post, user, story, message...)
│   │   ├── routes/         # Express route'lar
│   │   ├── middleware/     # Auth, fayl yuklash (multer)
│   │   ├── sockets/        # Socket.io real-time xabarlar
│   │   ├── db/             # PostgreSQL pool va schema.sql
│   │   ├── utils/          # JWT, cron job (stories tozalash)
│   │   └── types/          # TypeScript interfeyslar
│   └── uploads/            # Yuklangan rasm/video fayllar
└── frontend/
    ├── src/
    │   ├── pages/           # Sahifalar (Feed, Explore, Profile...)
    │   ├── components/      # UI komponentlar (PostCard, StoriesBar...)
    │   ├── hooks/            # TanStack Query hooklar
    │   ├── store/            # Zustand (auth holati)
    │   ├── lib/              # API client, Socket.io client
    │   └── types/            # TypeScript interfeyslar
```

## Keyingi qadamlar (ixtiyoriy kengaytirishlar)

- Cloudinary/S3 orqali fayl yuklashni production uchun sozlash
- Reels (qisqa videolar) funksiyasi
- Hashtag va mention tizimi
- Push notifications
- Video/audio qo'ng'iroqlar
