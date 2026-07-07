هاو README.md كامل ومنظم. انسخو كامل وحطو في الملف:

````md
# Crowd Mapping Backend

## 1. Project Objective

Crowd Mapping Backend is a RESTful API developed for the Advanced Programming course.

The goal of the project is to manage a crowd-mapping system for road defect reports. Authenticated users can create reports about road problems such as potholes and road depressions. Administrators can validate or reject reports, users can earn coins as rewards, and the system provides statistics, clustering and geographic search features.

---

## 2. Technologies Used

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcryptjs
- express-validator
- json2csv
- PDFKit
- Turf.js DBSCAN
- geolib
- Jest
- Docker / Docker Compose

---

## 3. Main Features

### Authentication
- User registration
- User login
- JWT authentication
- User profile

### Report Management
- Create a new report
- Get all reports
- Get personal reports
- Filter reports by status
- Filter reports by date range
- Update a report
- Delete a report

### Admin Features
- Validate or reject a report
- Bulk update report status
- Recharge user coins

### Reward and Credit System
- Users receive 0.1 coins for each validated report
- Users receive 0.15 coins after more than 10 validated reports
- Requests are blocked with `401 Unauthorized` when user coins are finished
- Admin can recharge user coins

### Leaderboard
- Public ranking of users ordered by coins
- Supports pagination

### Statistics and Export
- Statistics grouped by defect type, severity and status
- Export statistics as JSON
- Export statistics as CSV
- Export statistics as PDF

### Geographic Features
- DBSCAN clustering on validated reports
- Clustering by defect type and severity
- Export clustering results as JSON, CSV or PDF
- Nearby reports search using Haversine distance
- Export nearby reports as JSON or CSV

### Security and Middleware
- JWT authentication middleware
- Admin authorization middleware
- Request validation middleware
- Coins checking middleware
- Global error handling middleware

### Testing
- Jest tests for middleware functions
- Tests for admin authorization middleware
- Tests for request validation middleware

---

## 4. Project Structure

```text
src
│
├── config
│   └── database.ts
│
├── controllers
│   ├── authController.ts
│   ├── reportController.ts
│   └── userController.ts
│
├── middlewares
│   ├── adminMiddleware.ts
│   ├── authMiddleware.ts
│   ├── coinsMiddleware.ts
│   ├── errorMiddleware.ts
│   └── validationMiddleware.ts
│
├── models
│   ├── Report.ts
│   └── User.ts
│
├── routes
│   ├── authRoutes.ts
│   ├── reportRoutes.ts
│   └── userRoutes.ts
│
├── seeders
│   └── seed.ts
│
├── tests
│   ├── adminMiddleware.test.ts
│   └── validationMiddleware.test.ts
│
├── utils
│   └── jwt.ts
│
└── server.ts
```

---

## 5. Installation

Clone the repository:

```bash
git clone <repository-url>
cd crowd-mapping-backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root folder:

```env
DB_NAME=crowd_mapping
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=mysecretkey
```

Run the development server:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

---

## 6. Database and Seed

The project uses PostgreSQL with Sequelize ORM.

To initialize the database with demo data:

```bash
npm run seed
```

The seed script creates:

- 1 admin user
- 20 normal users
- 100 reports with different:
  - defect types
  - severities
  - statuses
  - coordinates around Ancona
  - dates

Demo admin account:

```text
Email: kraiem@test.com
Password: 123456
```

Demo user accounts:

```text
Email: user1@test.com
Password: 123456
```

Users go from:

```text
user1@test.com
```

to:

```text
user20@test.com
```

---

## 7. API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

Body:

```json
{
  "name": "Kraiem",
  "email": "kraiem@test.com",
  "password": "123456"
}
```

#### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "kraiem@test.com",
  "password": "123456"
}
```

#### Profile

```http
GET /api/auth/profile
```

Requires Bearer Token.

---

### Reports

#### Create Report

```http
POST /api/reports
```

Requires Bearer Token.

Body:

```json
{
  "latitude": 43.615,
  "longitude": 13.518,
  "defectType": "BUCA",
  "severity": "HIGH"
}
```

#### Get All Reports

```http
GET /api/reports
```

#### Get My Reports

```http
GET /api/reports/me
```

Optional filters:

```http
GET /api/reports/me?status=PENDING
```

```http
GET /api/reports/me?startDate=2026-01-01&endDate=2026-06-30
```

#### Update Report

```http
PUT /api/reports/:id
```

#### Delete Report

```http
DELETE /api/reports/:id
```

---

### Admin Report Validation

#### Update Report Status

```http
PUT /api/reports/:id/status
```

Admin only.

Body:

```json
{
  "status": "VALIDATED"
}
```

or:

```json
{
  "status": "REJECTED"
}
```

#### Bulk Update Report Status

```http
PUT /api/reports/bulk-status
```

Admin only.

Body:

```json
{
  "ids": [1, 2, 3],
  "status": "VALIDATED"
}
```

---

### Statistics

#### Get Statistics

```http
GET /api/reports/statistics
```

#### Export Statistics

```http
GET /api/reports/statistics/export?format=json
```

```http
GET /api/reports/statistics/export?format=csv
```

```http
GET /api/reports/statistics/export?format=pdf
```

---

### DBSCAN Clustering

#### Get Clusters

```http
GET /api/reports/clusters?defectType=BUCA&severity=HIGH&radius=100&format=json
```

Supported formats:

```text
json
csv
pdf
```

Example:

```http
GET /api/reports/clusters?defectType=BUCA&severity=HIGH&radius=100&format=csv
```

---

### Nearby Reports

#### Search Nearby Reports

```http
GET /api/reports/nearby?latitude=43.615&longitude=13.518&radius=1000&defectType=BUCA&severity=HIGH&format=json
```

Supported formats:

```text
json
csv
```

Optional date filters:

```http
GET /api/reports/nearby?latitude=43.615&longitude=13.518&radius=1000&defectType=BUCA&severity=HIGH&startDate=2026-01-01&endDate=2026-06-30&format=json
```

---

### Users

#### Leaderboard

```http
GET /api/users/leaderboard
```

With pagination:

```http
GET /api/users/leaderboard?page=1&limit=10
```

#### Recharge User Coins

```http
PUT /api/users/recharge
```

Admin only.

Body:

```json
{
  "email": "user1@test.com",
  "coins": 10
}
```

---

## 8. Authentication and Authorization

The project uses JWT tokens.

Protected routes require:

```http
Authorization: Bearer <token>
```

There are two roles:

```text
USER
ADMIN
```

Admin routes require both authentication and admin authorization.

---

## 9. Coins System

Each authenticated user has a number of coins stored in the database.

If the user has no coins, protected report requests return:

```http
401 Unauthorized
```

When a request is accepted, the system checks the user coins using the coins middleware.

Admins can recharge user coins through:

```http
PUT /api/users/recharge
```

---

## 10. Reward System

When a report is validated:

- The user receives `0.1` coins.
- If the user has more than 10 validated reports, the reward becomes `0.15` coins.

This reward is applied only when the report changes from a non-validated status to `VALIDATED`.

---

## 11. DBSCAN Clustering

The project uses DBSCAN clustering to group validated reports geographically.

The clustering uses:

- Latitude
- Longitude
- Defect type
- Severity
- Search radius

Only reports with status:

```text
VALIDATED
```

are used for clustering.

---

## 12. Nearby Search

Nearby search returns validated reports within a radius expressed in meters.

It uses Haversine distance calculation through the `geolib` library.

Filters:

- Latitude
- Longitude
- Radius
- Defect type
- Severity
- Optional date range

---

## 13. Design Patterns

### MVC Pattern

The project follows the MVC architecture.

- Models define database entities.
- Controllers contain business logic.
- Routes define API endpoints.

This improves code organization and maintainability.

### Middleware Pattern

Express middlewares are used for:

- Authentication
- Admin authorization
- Coins checking
- Request validation
- Error handling

This separates common logic from controller logic.

### Singleton Pattern

The Sequelize database connection is created once and reused throughout the application.

This avoids multiple database connections and centralizes database configuration.

---

## 14. UML Diagrams

### Use Case Diagram

Main actors:

- User
- Admin

User can:

- Register
- Login
- Create report
- View own reports
- Update own reports
- Delete own reports
- View leaderboard
- View statistics
- Search nearby reports
- Run clustering

Admin can:

- Validate report
- Reject report
- Bulk update reports
- Recharge user coins
- Access all user actions

### Sequence Diagram: Create Report

```text
User -> API: POST /api/reports
API -> AuthMiddleware: Verify JWT
AuthMiddleware -> API: User authenticated
API -> CoinsMiddleware: Check user coins
CoinsMiddleware -> Database: Get user coins
Database -> CoinsMiddleware: Return coins
CoinsMiddleware -> Database: Decrease coins
API -> ValidationMiddleware: Validate request body
ValidationMiddleware -> API: Valid request
API -> ReportController: createReport()
ReportController -> Database: Insert report
Database -> ReportController: Report created
ReportController -> User: 201 Created
```

### Sequence Diagram: Validate Report

```text
Admin -> API: PUT /api/reports/:id/status
API -> AuthMiddleware: Verify JWT
AuthMiddleware -> API: Admin authenticated
API -> AdminMiddleware: Check admin role
AdminMiddleware -> Database: Get user role
Database -> AdminMiddleware: Return ADMIN
API -> ReportController: updateReportStatus()
ReportController -> Database: Find report
Database -> ReportController: Return report
ReportController -> Database: Update status
ReportController -> Database: Count validated reports
ReportController -> Database: Update user coins
ReportController -> Admin: 200 OK
```

---

## 15. Testing

The project uses Jest for middleware testing.

Tested middlewares:

- Admin authorization middleware
- Request validation middleware

Run tests:

```bash
npm test
```

Expected result:

```text
Test Suites: 2 passed
Tests: 4 passed
```

---

## 16. Docker

The project includes:

- Dockerfile
- docker-compose.yml

Run with Docker:

```bash
docker compose up --build
```

The Docker setup includes:

- Node.js backend container
- PostgreSQL database container

---

## 17. Postman Tests

The project was tested using Postman.

Main tested groups:

- Authentication
- Reports CRUD
- Admin status update
- Bulk update
- Statistics export
- DBSCAN clustering
- Nearby search
- Leaderboard
- Coins recharge

The Postman collection can be exported and included in the repository.

---

## 18. Environment Variables

```env
DB_NAME=crowd_mapping
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=mysecretkey
```

For Docker, the backend uses:

```env
DB_HOST=postgres
```

---

## 19. Author

Kraiem Ali Nasrallah
Chebil Foued

Master's Degree in Computer and Automation Engineering  
Università Politecnica delle Marche
````
