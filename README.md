# Athletic Meet Management & Results System

A web application for managing athletic meets, schools, athletes, events, event entries, and competition results. The project consists of a React frontend, a PHP backend, and a MySQL database.

## Requirements

- Node.js and npm
- XAMPP (Apache and MySQL)

## Setup

1. Place the project folder in XAMPP's `htdocs` directory. The default frontend API URLs expect the project to be available at:

   `http://localhost/Athletic-Meet-Management-Results-System`

2. Start **Apache** and **MySQL** from the XAMPP control panel.

3. Create and populate the database:
   - Open phpMyAdmin at `http://localhost/phpmyadmin`.
   - Import [`database/schema.sql`](./database/schema.sql). The script creates the `meet_db` database and its tables.

4. Check the database connection settings in [`backend/config/db.php`](./backend/config/db.php). The defaults are MySQL at `127.0.0.1:3306`, user `root`, no password, and database `meet_db`. Update these values if your local MySQL setup differs.

5. Install frontend dependencies:

   ```sh
   npm --prefix frontend install
   ```

## Run the application

Start the frontend development server from the project root:

```sh
npm --prefix frontend run dev
```

Open the URL Vite prints in the terminal. The frontend/backend integration is configured for the default Vite origin `http://localhost:5173`; keep that port in use for API requests unless the backend CORS settings are updated to match another origin.

The PHP API is served by XAMPP under:

`http://localhost/Athletic-Meet-Management-Results-System/backend`

## Frontend scripts

Run these from the project root using `npm --prefix frontend run <script>`:

| Script | Description |
| --- | --- |
| `dev` | Start the Vite development server |
| `build` | Build the frontend for production |
| `preview` | Preview the production build locally |
| `lint` | Run ESLint |

## Project structure

```text
backend/      PHP API endpoints and MySQL connection
database/     MySQL schema
frontend/     React application built with Vite
```
