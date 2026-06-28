# Mentorship-Platform

![GitHub stars](https://img.shields.io/github/stars/OmarAliSiad/Mentorship-Platform?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/OmarAliSiad/Mentorship-Platform?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/OmarAliSiad/Mentorship-Platform?style=for-the-badge&logo=github) ![Last commit](https://img.shields.io/github/last-commit/OmarAliSiad/Mentorship-Platform?style=for-the-badge&logo=github) ![npm version](https://img.shields.io/npm/v/backend?style=for-the-badge&logo=npm&logoColor=white) ![npm downloads](https://img.shields.io/npm/dm/backend?style=for-the-badge&logo=npm&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![License](https://img.shields.io/badge/license-ISC-green?style=for-the-badge)

## 📑 Table of Contents

- [📝 Description](#description)
- [📸 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [⚡ Quick Start](#-quick-start)
- [📦 Key Dependencies](#-key-dependencies)
- [🚀 Available Scripts](#-available-scripts)
- [🌐 API Endpoints](#-api-endpoints)
- [📁 Project Structure](#-project-structure)
- [🛠️ Development Setup](#️-development-setup)
- [👥 Contributors](#-contributors)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

## 📝 Description

Mentorship-Platform — a backend api built with Express.js, JavaScript, MongoDB, Vite.

## 📸 Screenshots

![admin dashboard](https://raw.githubusercontent.com/OmarAliSiad/Mentorship-Platform/main/frontend/src/assets/images/admin_dashboard.png)

![admin stacks](https://raw.githubusercontent.com/OmarAliSiad/Mentorship-Platform/main/frontend/src/assets/images/admin_stacks.png)

![admin statistics](https://raw.githubusercontent.com/OmarAliSiad/Mentorship-Platform/main/frontend/src/assets/images/admin_statistics.png)

![admin users](https://raw.githubusercontent.com/OmarAliSiad/Mentorship-Platform/main/frontend/src/assets/images/admin_users.png)

![mentorship dashboard](https://raw.githubusercontent.com/OmarAliSiad/Mentorship-Platform/main/frontend/src/assets/images/mentorship_dashboard.png)

![mentorship history](https://raw.githubusercontent.com/OmarAliSiad/Mentorship-Platform/main/frontend/src/assets/images/mentorship_history.png)

## 🛠️ Tech Stack

- 🚀 **Express.js**
- 🟨 **JavaScript**
- 🍃 **MongoDB**
- ⚡ **Vite**

**Notable libraries:** Mongoose

## 🏗️ Architecture

A high-level view of how the main pieces fit together:

```mermaid
flowchart TD
    User["👤 User / Browser"]
    API["⚙️ Express API"]
    User --> API
    DB[("🗄️ MongoDB")]
    API --> DB
```

## ⚡ Quick Start

```bash

# 1. Clone the repository
git clone https://github.com/OmarAliSiad/Mentorship-Platform.git

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

## 📦 Key Dependencies

```
bcryptjs: ^3.0.3
cors: ^2.8.6
dotenv: ^17.4.2
express: ^5.2.1
jsonwebtoken: ^9.0.3
mongoose: ^9.7.0
```

## 🚀 Available Scripts

- **dev** — `npm run dev`

## 🌐 API Endpoints

Detected endpoints (best-effort scan):

```
GET /api/health
```

## 📁 Project Structure

```
.
├── Backend
│   ├── package.json
│   ├── server.js
│   └── src
│       ├── config
│       │   └── db.js
│       ├── controllers
│       │   ├── authController.js
│       │   ├── mentorController.js
│       │   └── studentController.js
│       ├── middleware
│       │   └── authMiddleware.js
│       ├── models
│       │   ├── MentorAvailability.js
│       │   ├── MentorProfile.js
│       │   ├── Session.js
│       │   ├── Stack.js
│       │   └── User.js
│       └── routes
│           ├── adminRoutes.js
│           ├── authRoutes.js
│           ├── mentorRoutes.js
│           ├── stackRoutes.js
│           └── studentRoutes.js
├── design.md
├── frontend
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── images
│   │   │       ├── admin_dashboard.png
│   │   │       ├── admin_stacks.png
│   │   │       ├── admin_statistics.png
│   │   │       ├── admin_users.png
│   │   │       ├── mentorship_dashboard.png
│   │   │       ├── mentorship_history.png
│   │   │       ├── mentorship_mentor.png
│   │   │       └── students_dashboard.png
│   │   ├── components
│   │   │   └── ui
│   │   │       ├── button.jsx
│   │   │       ├── pagination.jsx
│   │   │       ├── select.jsx
│   │   │       ├── skeleton.jsx
│   │   │       └── sonner.jsx
│   │   ├── index.css
│   │   ├── layouts
│   │   │   ├── FloatingNav.jsx
│   │   │   ├── MinimalistFooter.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── lib
│   │   │   └── utils.js
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── MentorDashboard.jsx
│   │   │   ├── MentorProfile.jsx
│   │   │   ├── MentorSearch.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── StudentDashboard.jsx
│   │   └── store
│   │       ├── authStore.js
│   │       └── themeStore.js
│   └── vite.config.js
├── overview.md
└── prd.md
```

## 🛠️ Development Setup

### Node.js / JavaScript
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` (or `yarn` / `pnpm install` / `bun install`)
3. Start the dev server: see the **Quick Start** above

## 👥 Contributors

Thanks to everyone who has contributed to this project:

<p align="left">
<a href="https://github.com/mohamedahmed-dev" title="mohamedahmed-dev"><img src="https://avatars.githubusercontent.com/u/214737066?v=4&s=64" width="64" height="64" alt="mohamedahmed-dev" style="border-radius:50%" /></a>
<a href="https://github.com/OmarAliSiad" title="OmarAliSiad"><img src="https://avatars.githubusercontent.com/u/105920279?v=4&s=64" width="64" height="64" alt="OmarAliSiad" style="border-radius:50%" /></a>
<a href="https://github.com/ahmed-azab271" title="ahmed-azab271"><img src="https://avatars.githubusercontent.com/u/199368679?v=4&s=64" width="64" height="64" alt="ahmed-azab271" style="border-radius:50%" /></a>
<a href="https://github.com/Ramadan-Elgamal" title="Ramadan-Elgamal"><img src="https://avatars.githubusercontent.com/u/107793891?v=4&s=64" width="64" height="64" alt="Ramadan-Elgamal" style="border-radius:50%" /></a>
</p>

[See the full list of contributors →](https://github.com/OmarAliSiad/Mentorship-Platform/graphs/contributors)

## 👥 Contributing

Contributions are welcome! Here's the standard flow:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/OmarAliSiad/Mentorship-Platform.git`
3. **Branch**: `git checkout -b feature/your-feature`
4. **Commit**: `git commit -m 'feat: add some feature'`
5. **Push**: `git push origin feature/your-feature`
6. **Open** a pull request

Please follow the existing code style and include tests for new behavior where applicable.

## 📜 License

This project is licensed under the **ISC** License.

---
*This README was generated with ❤️ by [ReadmeBuddy](https://readmebuddy.com)*
