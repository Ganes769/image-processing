# Image Processing API

A REST API for uploading, transforming, and managing images — built with **Node.js**, **Express**, **Sharp**, **Cloudinary**, and **PostgreSQL** (via Drizzle ORM).

**Repository:** [https://github.com/Ganes769/image-processing](https://github.com/Ganes769/image-processing)

---

https://roadmap.sh/projects/image-processing-service

## Tech Stack

| Layer            | Technology           |
| ---------------- | -------------------- |
| Runtime          | Node.js + TypeScript |
| Framework        | Express              |
| Image Processing | Sharp                |
| Cloud Storage    | Cloudinary           |
| Database         | PostgreSQL           |
| ORM              | Drizzle ORM          |
| Auth             | JWT (jose)           |
| Password Hashing | bcrypt               |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account ([console.cloudinary.com](https://console.cloudinary.com))

### Installation

```bash
git clone https://github.com/Ganes769/image-processing.git
cd image-processing
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# JWT
secret=your_jwt_secret

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
PGHOST=localhost
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_user
PGPASSWORD=your_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Database Setup

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

### Run the Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

---

## API Reference

All protected routes require the header:

```
Authorization: Bearer <token>
```

---

### Auth

#### Register

```
POST /api/auth/register
```

**Body:**

```json
{
  "username": "john",
  "password": "secret123"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": { "id": 1, "username": "john", "createdAt": "..." },
  "token": "<jwt>"
}
```

---

#### Login

```
POST /api/auth/login
```

**Body:**

```json
{
  "username": "john",
  "password": "secret123"
}
```

**Response:**

```json
{
  "message": "login success",
  "token": "<jwt>"
}
```

---

### Images

#### Upload Image

```
POST /api/images/upload
```

- Protected
- Content-Type: `multipart/form-data`
- Field name: `image` or `file`

**Response:**

```json
{
  "message": "Image uploaded successfully",
  "image": { "id": 3, "url": "https://res.cloudinary.com/...", ... }
}
```

---

### Transformations

#### Transform an Image

```
POST /api/image/:id/transform
```

- Protected
- `:id` — the original image id

**Body (all fields optional):**

```json
{
  "transformation": {
    "resize": { "width": 300, "heigth": 300 },
    "crop": { "width": 200, "height": 200, "left": 10, "top": 10 },
    "rotate": 90,
    "format": "webp",
    "filters": {
      "grayscale": true,
      "sepia": false
    }
  }
}
```

Supported formats: `jpeg`, `jpg`, `png`, `webp`, `avif`

**Response:**

```json
{
  "id": 1,
  "url": "https://res.cloudinary.com/.../transformed-images/...",
  "public_id": "transformed-images/abc123",
  "format": "webp",
  "bytes": 45231,
  "width": 300,
  "height": 300,
  "imageId": 3,
  "userId": 1
}
```

---

#### Get All Transformed Images (Paginated)

```
GET /api/images?page=1&limit=10
```

- Protected

| Query Param | Default | Max   |
| ----------- | ------- | ----- |
| `page`      | `1`     | —     |
| `limit`     | `10`    | `100` |

**Response:**

```json
{
  "data": [ { "id": 1, "imageId": 3, "userId": 1, "url": "...", ... } ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

#### Get Transformed Images by Original Image ID

```
GET /api/images/:id
```

- Protected
- `:id` — the original image id

**Response:**

```json
{
  "data": [
    {
      "id": 2,
      "imageId": 3,
      "userId": 1,
      "url": "https://res.cloudinary.com/...",
      "format": "webp",
      "width": 300,
      "height": 300,
      "transformations": "{\"resize\":{\"width\":300,\"heigth\":300}}",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Database Schema

```
users
  id, username, password, createdAt

images
  id, user_id → users, file_name, mime_type, size_bytes, width, height, url, created_at

transformed_images
  id, image_id → images, user_id → users,
  url, public_id, format, width, height, size_bytes, transformations, created_at
```

---

## Scripts

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `npm run dev`         | Start dev server with hot reload |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate`  | Apply migrations to the database |
| `npm run db:studio`   | Open Drizzle Studio (DB GUI)     |
