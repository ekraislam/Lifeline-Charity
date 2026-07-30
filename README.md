# LifeLine - Charity & NGO Management Platform

LifeLine is a comprehensive full-stack web application designed to connect NGOs, volunteers, donors, and beneficiaries. It streamlines the process of running charity campaigns, managing volunteer events, receiving donations, and handling beneficiary requests.

## 🚀 Key Features

*   **User Roles:** Multi-role authentication (Admin, NGO, Volunteer, Donor, Beneficiary).
*   **Campaign Management:** NGOs can create and manage fundraising campaigns with specific financial goals.
*   **Donations:** Donors can securely contribute to campaigns and track their donation history.
*   **Volunteer & Event Management:** Organizers can create events, and volunteers can sign up, track their hours, and receive certificates.
*   **Beneficiary Requests:** Individuals or communities can submit requests for help, which can be approved and assigned to specific NGOs.
*   **Dashboard & Analytics:** Dedicated dashboards for each user role with relevant statistics and tools.

## 🛠 Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL 8.0
*   **Deployment:** Docker & Docker Compose (with Multistage Builds and Nginx for SPA routing)

---

## 🐳 Running with Docker (Recommended)

The easiest way to deploy and run the LifeLine platform is using Docker. The provided `docker-compose.yml` sets up the frontend, backend, and database automatically.

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) installed on your machine or VPS.
*   [Docker Compose](https://docs.docker.com/compose/install/) installed.

### Setup Instructions

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/ekraislam/Lifeline-Charity
    cd Lifeline-Charity
    ```

2.  **Configure Environment Variables:**
    *   Navigate to the `backend` folder and ensure the `.env` file is present. It should contain your database credentials and JWT secrets:
        ```env
        PORT=5000
        DB_HOST=db
        DB_USER=root
        DB_PASSWORD=secret
        DB_NAME=lifeline_db
        JWT_SECRET=your_jwt_secret
        ```
    *   Navigate to the `frontend` folder and ensure its `.env` file points to the backend API:
        ```env
        VITE_API_URL=http://localhost:5000
        ```
        *(Note: If deploying to a live VPS, change `localhost` to your actual server IP or domain).*

3.  **Build and Start the Containers:**
    Run the following command from the root directory of the project:
    ```bash
    docker compose up --build -d
    ```

4.  **Access the Application:**
    *   **Frontend:** Open your browser and go to `http://localhost` (or your VPS IP address).
    *   **Backend API:** Running on `http://localhost:5000`.

### 🔑 Default Admin Credentials

When the database is initialized for the first time via Docker, a default Admin account is automatically created. You can use this account to log in and manage the platform.

*   **Email:** `admin@lifeline.com`
*   **Password:** `admin123`

---

## 💾 Persistent Data & Volumes

The Docker setup is configured to ensure no data is lost if a container restarts or is rebuilt:
*   **MySQL Data:** Stored in the `mysql_data` Docker volume.
*   **Backend Uploads:** User avatars, campaign galleries, and uploaded documents are stored in the `backend_uploads` volume.

## 📁 Directory Structure

```text
LifeLine/
├── frontend/             # React application (Vite)
│   ├── src/              # React components, pages, and API calls
│   ├── Dockerfile        # Multistage Docker build for frontend
│   └── nginx.conf        # Nginx SPA routing configuration
├── backend/              # Node.js Express API
│   ├── src/              # Controllers, routes, and services
│   ├── schema.sql        # MySQL database schema (auto-runs on init)
│   ├── init-admin.sql    # Script to create the default admin user
│   └── Dockerfile        # Multistage Docker build for backend
└── docker-compose.yml    # Docker orchestration file
```

## 🛑 Stopping the Application

To stop the running containers without deleting your persistent data, run:
```bash
docker compose down
```
*(To completely remove the containers and reset the database volumes, you can use `docker compose down -v`)*
