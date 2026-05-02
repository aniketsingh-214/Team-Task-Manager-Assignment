# TaskFlow - Full Stack Task Management Application

This is a comprehensive, production-ready Full Stack Task Management Application built to demonstrate modern web development practices. This guide will walk you through the architecture, technologies, and structural decisions made in this project like a mentor explaining the codebase.

---

## Technical Stack Overview

### Frontend (Client)
* **React 19:** The core library for building the user interface using functional components and hooks.
* **Vite:** A lightning-fast frontend build tool that replaces Create React App. It provides instant server start and incredibly fast Hot Module Replacement (HMR).
* **Tailwind CSS v4:** A utility-first CSS framework for rapidly building custom designs without leaving your HTML/JSX.
* **Framer Motion:** A production-ready motion library for React to handle smooth animations and transitions.
* **React Router v7:** Declarative routing for React applications to handle navigation between pages (Dashboard, Login, Tasks, etc.) without reloading the browser.
* **Lucide React:** A beautiful and consistent icon toolkit.

### Backend (Server)
* **Node.js & Express.js:** A minimal and flexible Node.js web application framework providing a robust set of features for web and mobile applications.
* **PostgreSQL:** A powerful, open-source object-relational database system used to store users, projects, and tasks reliably.
* **node-postgres (pg):** Non-blocking PostgreSQL client for Node.js used to execute SQL queries.
* **JSON Web Tokens (JWT):** Used for securely transmitting information between the client and server as a JSON object, specifically for user authentication.
* **Bcryptjs:** A library to help hash passwords securely before storing them in the database.

---

## Deep Dive: Architecture & Folder Structure

### 1. The Database Schema (`database.sql`)
The foundation of any application is its data layer. Here, we use a relational database with three primary tables:
* **`users`**: Stores authentication credentials (`email`, hashed `password`), user `name`, and `role` (either 'admin' or 'member'). The role determines permissions across the app.
* **`projects`**: Acts as a container for tasks. It includes a foreign key `created_by` linking back to the `users` table.
* **`tasks`**: The core entity. It tracks what needs to be done. It includes `status` (todo, in-progress, done), `due_date`, and links to both the `projects` table (which project it belongs to) and the `users` table (who it is assigned to).

### 2. The Backend (`/server`)
The backend is designed as a RESTful API. 

* **`index.js`**: The entry point. It initializes the Express application, sets up middleware like CORS (to allow the frontend to communicate with the backend) and JSON body parsing, and connects the API routes.
* **`package.json`**: Manages backend dependencies (`express`, `pg`, `bcryptjs`, `jsonwebtoken`) and defines scripts like `npm run dev` which uses `nodemon` to automatically restart the server upon file changes.
* **`.env`**: Stores sensitive configuration variables like database credentials (`DB_USER`, `DB_PASSWORD`) and the JWT secret key. This file is never committed to version control for security.
* **`src/config/db.js`**: Centralizes the database connection pool logic. It creates a single connection pool using `pg` that is shared across the application to handle multiple concurrent database requests efficiently.

### 3. The Frontend (`/client`)
The frontend is a Single Page Application (SPA).

* **`main.jsx`**: The entry point of the React application. It mounts the `<App />` component into the DOM inside a `<StrictMode>` wrapper (which helps identify potential problems in the app).
* **`App.jsx`**: The root component that sets up the routing infrastructure using `BrowserRouter`. It wraps the entire application in an `<AuthProvider>` to make authentication state globally accessible. It also defines protected routes to ensure unauthenticated users are redirected to the Login page.
* **`src/context/AuthContext.jsx`**: Utilizes React Context API to manage global state for authentication. It handles login, signup, and logout operations, and persists the JWT token in `localStorage` so the user remains logged in across browser refreshes.
* **`src/api/api.js`**: An Axios instance configured to automatically attach the JWT token to the `Authorization` header of every outgoing request. This abstracts away the complexity of authenticated requests from the UI components.

### 4. User Interface Components & Pages
* **`src/layouts/MainLayout.jsx`**: A structural component that wraps all authenticated pages. It renders the `Sidebar` on the left and provides a central scrolling area (`<Outlet />`) where the actual page content (Dashboard, Projects, Tasks) is injected.
* **`src/components/Sidebar.jsx`**: The primary navigation menu. It uses `NavLink` to highlight the currently active route and dynamically renders user information (including role-specific icons) fetched from the `AuthContext`.
* **`src/pages/Dashboard.jsx`**: The main landing view. It aggregates data (like task statistics) and presents it using reusable visual components. It heavily relies on Tailwind utility classes for its responsive, glassmorphism-inspired design.
* **`src/pages/Login.jsx` & `Signup.jsx`**: Handle user entry. They capture user input, communicate with the `AuthContext` to authenticate against the backend, and handle error states gracefully.
* **`src/pages/Projects.jsx` & `Tasks.jsx`**: The functional core where users manage entities. They perform CRUD (Create, Read, Update, Delete) operations by interacting with the backend API. They utilize optimistic UI updates and loading states to ensure a smooth user experience.

---

## Styling Strategy: Tailwind CSS v4

This project utilizes the latest version of Tailwind CSS. Instead of writing custom CSS classes in separate stylesheets, the styling is applied directly inline within the JSX elements using utility classes. 

**Key Design Patterns Used:**
1. **Utility-First:** You'll see long strings of classes like `flex items-center justify-between p-4`. This means "use flexbox, align items to center vertically, push them to opposite ends horizontally, and apply padding of 1rem".
2. **Glassmorphism:** Achieved using combinations of `bg-white/5` (white background with 5% opacity), `backdrop-blur-md` (blurring elements behind it), and `border border-white/10`.
3. **Responsive Design:** Prefixing classes with screen sizes (e.g., `md:grid-cols-2`) tells the layout to change dynamically based on the device width.
4. **Vite Integration:** Configured in `vite.config.js` via the `@tailwindcss/vite` plugin, and initialized using a single `@import "tailwindcss";` in `index.css`.

---

## Authentication Flow Explanation

1. **Registration/Login:** The user submits their credentials via the React frontend.
2. **Backend Verification:** The Express server receives the request. It either creates a new user (hashing the password with `bcryptjs`) or compares the incoming password with the stored hash for existing users.
3. **Token Generation:** If successful, the backend generates a signed JSON Web Token (JWT) containing the user's ID and role, and sends it back to the client.
4. **Client Storage:** The React `AuthContext` saves this token to the browser's `localStorage` and updates its internal state to reflect that a user is logged in.
5. **Authenticated Requests:** Every subsequent request made by the client via the Axios instance (`api.js`) automatically includes this token in its headers. The backend verifies this token before allowing access to protected routes (like creating a task or fetching projects).
