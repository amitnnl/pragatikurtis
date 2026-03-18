# Deployment Guide for Pragati Kurties

Your application is feature-complete. Follow these steps to deploy it to your live server.

## 1. Build the Frontend
Since this is a React application, you need to compile it into static files.

1.  Open your terminal/command prompt.
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  Run the build command:
    ```bash
    npm run build
    ```
4.  This will create a `dist` folder inside `frontend`.

## 2. Server Setup (XAMPP/Apache)
1.  **Backend:** Ensure your `backend` folder is in `C:\xampp\htdocs\pragatikurties\backend`.
2.  **Frontend:** Copy all files **inside** `frontend/dist` and paste them into `C:\xampp\htdocs\pragatikurties\`.
    *   *Note:* You should see `index.html` and an `assets` folder directly in `pragatikurties`.

## 3. Database
1.  Ensure your live database is running.
2.  Import `final_database.sql` into your phpMyAdmin or MySQL server to ensure all tables (including the new `banners` and `rfqs` tables) are present.

## 4. Configuration
1.  Check `backend/config/database.php` to ensure the credentials (`username`, `password`, `db_name`) match your live database.
2.  Check `frontend/src/config/branding.js` if you need to change any default hardcoded values, though the Admin Panel settings will override these.

## 5. Verify
1.  Visit `http://localhost/pragatikurties/` in your browser.
2.  You should see the live site.
3.  Try logging in as Admin to `http://localhost/pragatikurties/login`.

## Troubleshooting
*   **404 on Refresh:** If refreshing a page gives a 404 error, ensure the `.htaccess` file (which I added to `public`) was copied to the root directory. This tells Apache to let React handle the routing.
*   **API Errors:** If data isn't loading, check the Network tab in your browser's Developer Tools (F12). Ensure requests are going to `http://localhost/pragatikurties/backend/...`.
