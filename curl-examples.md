# API Testing with cURL Examples

## Authentication Flow

### 1. User Login (Get Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 2. Admin Login (Get Admin Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@automaticreview.com",
    "password": "Admin123!"
  }'
```

### 3. Access Protected Route (Replace YOUR_TOKEN with actual token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Public Routes (No Authentication Required)

### Health Check
```bash
curl http://localhost:3000/health
```

### User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

## Protected Routes (Authentication Required)

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Submit Review
```bash
curl -X POST http://localhost:3000/api/reviews/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Review",
    "content": "This is the content to be reviewed.",
    "category": "academic",
    "priority": "medium"
  }'
```

### Get User Reviews
```bash
curl -X GET http://localhost:3000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Admin Routes (Admin Authentication Required)

### Get All Reviews (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/reviews \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get All Users (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## PowerShell Examples (Windows)

### Login and Get Token
```powershell
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"TestPassword123!"}'
$token = ($loginResponse.Content | ConvertFrom-Json).data.token
```

### Access Protected Route
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/profile" -Method GET -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
```

## Common Error Responses

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Password confirmation is required"]
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Route not found",
  "message": "Cannot GET /api/nonexistent"
}
```

