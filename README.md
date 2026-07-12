# Library Web

Library Web is a frontend SPA for a digital library management system, built with Angular.

The application provides a public landing area, authentication pages, protected user routes, administrative routes, book catalogue management, user loan management and admin-only management pages.

The frontend consumes a Spring Boot REST API called `libraryapi`.

## Tech Stack

- Angular 21 standalone
- TypeScript
- Tailwind CSS
- Angular Router
- Angular Signals
- Reactive Forms
- RxJS
- JWT authentication using `HttpOnly` cookies
- REST API integration with Spring Boot

## Features

### Public Area

- Landing page
- Login page
- Register page
- Privacy Policy page
- Terms and Conditions page
- Cookie Policy page
- Not Found fallback page

### Authentication

- Login through the backend API
- User registration through the backend API
- Session restoration on app startup
- Logout flow
- Route guards for authenticated users
- Route guards for guest-only pages
- Admin guard for restricted routes
- Credential handling through an HTTP interceptor

### Authenticated User Area

The authenticated section uses a dedicated layout with sidebar navigation.

Available user features:

- Dashboard overview
- Book catalogue
- Book detail page
- Book search by title, author, ISBN or publication year
- Loan request flow
- User loan management
- Loan search by status, start date or due date
- Active loans shown by default
- Account page
- Not Found handling for unavailable routes

### Admin Area

Admin users have access to additional management pages:

- Admin dashboard
- Book creation
- Book edition
- Book deletion
- User management
- User search by email, DNI, first name or last name
- Frontend pagination for the user list
- User edition
- User deletion
- Loan management
- Loan edition
- Loan closing
- Loan deletion

## Domain Services

The project separates HTTP communication from frontend state management.

```text
BookApiService  → HTTP communication with /books
BookService     → Book domain state and operations

UserApiService  → HTTP communication with /users
UserService     → User domain state and operations

LoanApiService  → HTTP communication with /loans
LoanService     → Loan domain state and operations

AuthApiService  → HTTP communication with /auth
AuthService     → Authenticated user and session state
```

Each domain state service manages:

- domain data
- loading state
- error state
- action-specific state when needed

State is handled with Angular signals and exposed as readonly signals.

## Authentication Model

Authentication is based on JWT stored in an `HttpOnly` cookie.

The frontend does not store authentication tokens in `localStorage` and does not manually attach Bearer tokens to requests.

Credential handling is centralized through an HTTP interceptor.

`AuthService` remains the source of truth for the authenticated user and session state.

## Project Structure

```text
src/app/
├── guards/
├── initializers/
├── interceptors/
├── layout/
├── models/
├── pages/
├── services/
├── app.config.ts
├── app.routes.ts
└── app.ts
```

### Main Folders

```text
guards/
→ Route protection for authentication, guests and admin access.

initializers/
→ Session restoration during application startup.

interceptors/
→ HTTP credential configuration.

layout/
→ Public and authenticated layouts, header, footer and sidebar.

models/
→ API and domain models grouped by feature.

pages/
→ Routable Angular pages.

services/
→ API services and frontend state services grouped by domain.
```

## Main Routes

### Public Routes

```text
/home
/login
/register
/privacy-policy
/terms-and-conditions
/cookie-policy
```

### Authenticated Routes

```text
/dashboard
/dashboard/books
/dashboard/books/:id
/dashboard/my-loans
/dashboard/my-loans/new
/dashboard/account
```

### Admin Routes

```text
/dashboard/admin
/dashboard/books/new
/dashboard/admin/users
/dashboard/admin/loans
```

## Backend Requirement

This frontend consumes a Spring Boot API named `libraryapi`.

The API base URL is configured through the Angular environment files.

Example:

```ts
export const environment = {
  apiUrl: 'http://localhost:8080'
};
```

## Deployment

Planned deployment:

- Frontend: Vercel
- Backend: Railway
- Backend supporting services: Railway

The backend deployment requires several services, including the main API, databases, Kafka and supporting application services.

## Installation

```bash
npm install
```

## Development Server

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200
```

## Build

```bash
ng build
```

## Development Status

This project is currently in MVP-complete state.

Implemented:

- Public layout
- Authenticated layout
- Authentication flow
- Session restoration
- Route guards
- Admin-only routes
- Domain models
- API services
- Domain state services using Angular signals
- Static legal pages
- Not Found fallback page
- Authenticated dashboard
- Book catalogue
- Book detail page
- Book search
- Loan request flow
- User loan management
- Loan search
- Account page
- Admin dashboard
- Admin book management
- Admin user management
- Admin user search
- Admin user pagination
- Admin loan management
- Loading, error and empty states

## Future Improvements

Possible improvements for future iterations:

- Add unit tests for API services and domain services
- Add end-to-end tests for the main user flows
- Add internationalization support with a language selector
- Add dark mode support
- Add a dedicated user settings/preferences page
- Add backend pagination for large datasets
- Improve visual polish and accessibility details
- Add more advanced admin filtering options

## Author

Jabier Zurro Aduriz