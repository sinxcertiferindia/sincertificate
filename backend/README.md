# Backend Setup

This directory contains the Node.js/Express.js backend for the CertifyHub application.

## Getting Started

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install express mongoose dotenv
    ```

    *   **Note for Windows users:** If you encounter a PowerShell execution policy error, you might need to adjust your execution policy. Run PowerShell as an administrator and execute:

        ```powershell
        Set-ExecutionPolicy RemoteSigned
        ```

        (Confirm the change by typing 'Y' or 'A').

3.  **Create a `.env` file:**

    In the `backend` directory, create a new file named `.env` and add the following content:

    ```
    MONGO_URI=mongodb://localhost:27017/certifyhub
    ```

    *   **Note:** You will need to have a MongoDB instance running. For local development, you can install MongoDB locally or use a cloud-hosted solution like MongoDB Atlas.

4.  **Start the server:**

    ```bash
    npm start
    ```

    or

    ```bash
    node server.js
    ```
 