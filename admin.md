# Admin Module Implementation

Implement the Admin module for the Academic Mentorship & Code Review Platform using React and the existing project architecture.

## Requirements

### UI Framework

* Use Material UI, shadcn/ui, or TailwindCSS only.
* Do not use Bootstrap.
* Follow reusable component architecture.
* Make all pages responsive.
* Support loading states and empty states.

---

# Admin Routes

Create the following routes:

```txt
/admin
/admin/users
/admin/stacks
/admin/statistics
```

All routes must be protected and accessible only to users with role = "Admin".

---

# Admin Layout

Create:

* AdminLayout
* Sidebar
* Topbar

The layout should wrap all admin pages.

---

# Dashboard Page

Create `DashboardPage`.

Display cards showing:

* Total Users
* Total Mentors
* Total Students
* Total Sessions
* Total Technical Stacks

Use loading skeletons while data is loading.

---

# User Management Page

Create `UsersPage`.

Features:

* Fetch all users from:

```http
GET /api/admin/users
```

Display a table containing:

* Name
* Email
* Role
* Status
* Actions

Actions:

* Approve mentor
* Block user
* Unblock user

Update status using:

```http
PUT /api/admin/users/:id/status
```

Request body examples:

```json
{
  "status": "approved"
}
```

or

```json
{
  "status": "blocked"
}
```

Add:

* Search
* Pagination
* Loading Skeleton
* Empty State
* Toast Notifications
* Confirmation Dialog before status changes

---

# Technical Stacks Page

Create `StacksPage`.

Fetch stacks from:

```http
GET /api/stacks
```

Support:

## Create Stack

```http
POST /api/stacks
```

Example:

```json
{
  "name": "DevOps",
  "description": "CI/CD and deployment"
}
```

## Update Stack

```http
PUT /api/stacks/:id
```

## Delete Stack

```http
DELETE /api/stacks/:id
```

Display stacks inside a table containing:

* Name
* Description
* Actions

Actions:

* Edit
* Delete

Create reusable components:

* StackTable
* StackForm
* ConfirmDialog

Add:

* Toast notifications
* Loading skeleton
* Empty state

---

# Statistics Page

Create `StatisticsPage`.

Display:

* Scheduled Sessions
* Completed Sessions
* Canceled Sessions

Optional:
Use Recharts to visualize statistics.

---

# Components

Create reusable components:

```txt
components/
│
├── UserTable
├── StackTable
├── StackForm
├── SearchBar
├── Pagination
├── ConfirmDialog
├── LoadingSkeleton
└── EmptyState
```

---

# Folder Structure

```txt
src
│
├── pages
│     ├── DashboardPage
│     ├── UsersPage
│     ├── StacksPage
│     └── StatisticsPage
│
├── layouts
│     └── AdminLayout
│
├── components
│     ├── UserTable
│     ├── StackTable
│     ├── StackForm
│     ├── SearchBar
│     ├── Pagination
│     ├── ConfirmDialog
│     ├── LoadingSkeleton
│     └── EmptyState
│
├── routes
│     └── AdminRoutes
│
├── services
│     └── adminApi
│
└── hooks
```

---

# Additional Requirements

* Use React Router protected routes.
* Use Axios instance for API calls.
* Handle API errors gracefully.
* Use toast notifications for success and error messages.
* Follow clean code principles.
* Use reusable components.
* Support dark mode if the project already has theme support.
* Use lazy loading for admin pages.
* Do not modify other modules unless necessary.
* Keep the code modular and production-ready.
