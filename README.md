# Library Web

Library Web is a frontend SPA for a digital library management system, built with Angular.

The application provides a public landing area, authentication pages, protected user routes, administrative routes, and a reusable domain service layer prepared to consume a Spring Boot REST API called `libraryapi`.

## Tech Stack

- Angular 21 standalone
- TypeScript
- Tailwind CSS
- Angular Router
- Angular Signals
- RxJS
- JWT authentication using `HttpOnly` cookies
- REST API integration with Spring Boot

## Current Features

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

### Authenticated Area

The authenticated section uses a dedicated layout with sidebar navigation.

Prepared routes:

- Dashboard
- Books
- My Loans
- Account
- Admin Dashboard

### Domain Services

The project separates HTTP communication from frontend state management.

```text
BookApiService  → HTTP communication with /books
BookService     → Book domain state and operations

UserApiService  → HTTP communication with /users
UserService     → User domain state and operations

LoanApiService  → HTTP communication with /loans
LoanService     → Loan domain state and operations
```

Each domain state service manages:

- domain data
- loading state
- error state

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

## Routes

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
/dashboard/my-loans
/dashboard/account
/dashboard/admin
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

This project is currently under development.

Completed foundation:

- Public layout
- Authenticated layout
- Authentication flow
- Route guards
- Domain models
- API services
- Domain state services
- Static legal pages
- Not Found fallback page

Pending work:

- Dynamic authenticated dashboard
- Book catalogue integration
- User loan management page
- Account management features
- Admin dashboard functionality
- Full UI translation support
- Final visual polish and screenshots

## Author

Jabier Zurro Aduriz