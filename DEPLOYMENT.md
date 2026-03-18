# Deployment Plan for Pragati Kurtis

This guide provides the steps to deploy your e-commerce application, which consists of a PHP backend and a React frontend.

## Overview

- **Backend:** PHP application that connects to a MySQL database.
- **Frontend:** A modern React application built with Vite.

You will need a web hosting plan that supports PHP, MySQL, and allows you to upload files (e.g., via FTP or a File Manager).

---

## Step 1: Deploy the Backend

### 1.1. Export Your Local Database

First, you need to create a backup (`.sql` file) of your local `pragati_kurties` database. You can do this using a tool like phpMyAdmin or by running the `mysqldump` command.

**Using `mysqldump` (from your XAMPP shell or command prompt):**
```sh
"C:\\xampp\\mysql\\bin\\mysqldump.exe" -u root pragati_kurties > pragati_kurties_backup.sql
```
This command will create a `pragati_kurties_backup.sql` file in your current directory.

### 1.2. Set Up the Production Database

1.  Log in to your web hosting control panel (e.g., cPanel).
2.  Find the "MySQL Databases" section (or similar).
3.  Create a **new database**.
4.  Create a **new database user** and assign it a strong password.
5.  **Add the user to the database**, granting it all privileges.
6.  **Import the database backup:** Find "phpMyAdmin" in your control panel, select your new database, go to the "Import" tab, and upload the `pragati_kurties_backup.sql` file you created in step 1.1.

**Take note of your database name, username, and password.**

### 1.3. Upload Backend Files

1.  Using an FTP client (like FileZilla) or your hosting provider's File Manager, upload the **entire `backend` folder** from your local machine to your web host.
2.  It's common to place this inside the `public_html` (or `www`) directory, but you can place it at the root as well. The frontend configuration assumes it will be accessible at `your-domain.com/backend/`.

### 1.4. Configure Backend Environment

1.  In the `backend` folder on your server, find the `.env.example` file.
2.  **Rename** or **copy** this file to `.env`.
3.  **Edit the new `.env` file** and fill in the values for your production environment:
    - `JWT_SECRET_KEY`: Set this to a long, random string.
    - `DB_HOST`: Your database host (often `localhost`).
    - `DB_NAME`: The name of the production database you created.
    - `DB_USER`: The production database user you created.
    - `DB_PASS`: The password for that user.
    - `SMTP_*`: Your production email server details.
    - `RAZORPAY_*`: Your **LIVE** Razorpay keys.

---

## Step 2: Deploy the Frontend

The frontend has already been prepared for you. The necessary files are in the `frontend/dist` directory.

### 2.1. Upload Frontend Files

1.  Using your FTP client or File Manager, navigate to the **root directory** of your website (this is usually `public_html` or `www`).
2.  Upload **all the contents** of the local `frontend/dist` folder to this root directory.

The `frontend/dist` folder contains:
- `index.html`
- The `assets` folder
- `.htaccess` (this file might be hidden, ensure your FTP client shows hidden files)

**Your final file structure on the server should look something like this:**
```
/public_html/
├── assets/         (from frontend/dist)
├── backend/        (your entire backend folder)
├── .htaccess       (from frontend/dist)
└── index.html      (from frontend/dist)
```

---

## Step 3: Final Testing

1.  Navigate to your domain (`https://your-domain.com`).
2.  The website should load correctly. The React application will handle all the page navigation.
3.  Test key functionality:
    - View products.
    - Add items to the cart.
    - Create a user account.
    - Test the checkout process.
    - Ensure all settings (store name, contact info) are displayed correctly.

Your website should now be live!