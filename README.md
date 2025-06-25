# 🎬 NestJS Movie Recommender App with Redis

پروژه‌ای برای مدیریت، امتیازدهی و توصیه فیلم‌ها با استفاده از NestJS و Redis به عنوان حافظه‌ی موقت و سیستم صف پیام.

---

## 🧰 تکنولوژی‌های استفاده شده

- **NestJS** – فریم‌ورک مدرن برای توسعه اپلیکیشن‌های Node.js
- **Redis** – برای کشینگ، صف پیام (Pub/Sub)، ذخیره‌سازی امتیازها و اطلاعات ترند
- **Docker** – اجرای Redis در کانتینر مجزا
- **Swagger** – داکیومنت خودکار برای APIها
- **TypeScript**, **Yarn**, **dotenv**, و ...

---

## 📁 ساختار اصلی پروژه

```
nestjs-redis/
├── service1/               # پروژه NestJS
│   ├── movie/              # ماژول مدیریت فیلم‌ها
│   │   ├── movie.controller.ts
│   │   ├── movie.service.ts
│   │   └── movie.module.ts
│   ├── dataAccess/         # ارتباط با داده‌ها
│   ├── main.ts
│   └── ...
├── docker-compose.yml      # اجرای Redis با Docker
├── .env                    # تنظیمات محیطی پروژه
├── Dockerfile              # (در صورت نیاز) داکرایز کردن NestJS
└── README.md
```

---

## ⚙️ نصب و اجرای پروژه

### 1. کلون کردن پروژه

```bash
git clone https://github.com/your-username/nestjs-redis.git
cd nestjs-redis
```

### 2. اجرای Redis با Docker

```bash
docker-compose up -d
```

یا از فایل `start.bat` استفاده کنید (ویندوز):

```bash
start.bat
```

### 3. اجرای NestJS (در پوشه `service1`)

```bash
cd service1
yarn install
yarn start:dev
```

---

## 📦 تنظیمات محیطی (.env)

نمونه:

```
REDIS_HOST=localhost
REDIS_PORT=6379
```

> اگر NestJS را داخل Docker اجرا کنید، `REDIS_HOST` باید `redis` باشد.

---

## 🚀 امکانات پروژه

- 🔍 **جستجوی فیلم‌ها بر اساس ژانر**
- ⭐ **امتیازدهی به فیلم‌ها**
- 🎯 **توصیه فیلم‌ها بر اساس ژانرهای مورد علاقه‌ی کاربر**
- 🔥 **نمایش فیلم‌های ترند (محبوب)**
- 🕘 **لیست فیلم‌های اخیراً مشاهده‌شده**
- 📚 **نمایش ژانرهای موجود همراه با تعداد فیلم‌ها**

---

## 🧪 مستندات Swagger

بعد از اجرای پروژه، از طریق آدرس زیر می‌تونی مستندات API رو ببینی:

```
http://localhost:3000/api
```