# Image API

Header on both routes:

```
Authorization: Bearer <token>
```

## 1. Upload

```
POST /api/images/upload
```

Field: `image` or `file`  
Types: jpg, png, webp

| Status | Meaning |
|--------|---------|
| 201 | Uploaded |
| 400 | Not an image, or wrong field name |
| 401 | No token |
| 500 | Upload failed |

**201**

```json
{ "message": "Image uploaded successfully", "image": { "id": 3, "url": "...", "width": 800, "height": 600 } }
```

**400 — not an image**

```json
{ "message": "Only jpg, png, webp images are allowed" }
```

**400 — wrong field**

```json
{ "message": "Unexpected field", "expected_fields": ["image", "file"] }
```

## 2. Transform

```
POST /api/image/:id/transform
```

```json
{ "transformation": { "resize": { "width": 300, "heigth": 300 }, "format": "webp" } }
```

| Status | Meaning |
|--------|---------|
| 200 | Transformed |
| 401 | No token |
| 404 | Image id not found |
| 502 | Could not fetch original |
| 500 | Transform failed |

**200**

```json
{ "id": 1, "url": "...", "format": "webp", "width": 300, "height": 300 }
```
