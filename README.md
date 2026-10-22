# Image Processing API

Protected routes need:

```
Authorization: Bearer <token>
```

## Upload

```
POST /api/images/upload
```

- `multipart/form-data`
- Field name: `image` or `file`
- Types: jpg, png, webp

| Status | When |
|--------|------|
| 201 | Image uploaded |
| 400 | Not jpg/png/webp, or wrong field name |
| 401 | Missing or invalid token |
| 500 | Upload failed |

**201**

```json
{
  "message": "Image uploaded successfully",
  "image": { "id": 3, "url": "...", "width": 800, "height": 600 }
}
```

**400 — not an image**

```json
{ "message": "Only jpg, png, webp images are allowed" }
```

**400 — unexpected field**

```json
{ "message": "Unexpected field", "expected_fields": ["image", "file"] }
```

## Transform

```
POST /api/image/:id/transform
```

`:id` is the original image id.

```json
{
  "transformation": {
    "resize": { "width": 300, "heigth": 300 },
    "format": "webp"
  }
}
```

| Status | When |
|--------|------|
| 200 | Transform succeeded |
| 401 | Missing or invalid token |
| 404 | Image id not found |
| 502 | Could not fetch original image |
| 500 | Transform failed |

**200**

```json
{
  "id": 1,
  "url": "...",
  "format": "webp",
  "width": 300,
  "height": 300
}
```
