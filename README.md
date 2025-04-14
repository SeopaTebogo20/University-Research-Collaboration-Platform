# University-Research-Collaboration-Platforms

## Links of the softwares we will be using:
# Deployed App (Live App)
https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/

# For User Stories >
https://trello.com/b/Z44Nb2UI/collanexus

# For our Reposetory >
https://github.com/SeopaTebogo20/University-Research-Collaboration-Platform.git

# Before you write any code, PLEASE make sure you do pull request
1. git pull
# If you have already written some code before doing pull request, PLEASE run this command to pull the code without losing the code you wrote
1. git pull --no-rebase

# How to correctly push to a new branch
1. git checkout -b {name of your new branch}
2. (check if you are in the new branch you created by running this command): git branch
2. git add .
3. git commit -m "Your commit message"
4. git push origin {name of your new branch}

## HOW TO RUN THE PROJECT LOCALLY
 ## Run the following commands to install the necessary dependancies and to run the project
 1. npm install
 2. npm install express
 3. node src/server.js

# University Research and Collaboration Platform

## Overview

This is a Node.js Express-based web application designed for universities to streamline research activities and foster collaboration between researchers, reviewers, and administrators. The platform allows users to register, log in, view ongoing research projects, and manage research collaboration efficiently.

---

## Features

- Aesthetic **Landing Page** with `Login` and `Signup` options
- Role-based signup and login for:
  - **Researchers**
  - **Reviewers**
  - **Administrators**
- Email and password-based **authentication**
- Dashboard with role-specific features
- **Collaboration management** for researchers
- Tracking of **ongoing research projects**
- Responsive and accessible UI
- Secure backend integrated with **Supabase**
- App deployed on **Microsoft Azure**

---

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | HTML, CSS, JavaScript    |
| Backend     | Node.js, Express.js      |
| Database    | Supabase (PostgreSQL)    |
| Deployment  | Azure for Students       |
| Dev Tools   | GitHub, Trello, Jest     |

---

## Backend

The backend is built using **Node.js and Express**. It handles routing, user authentication, role-based logic, and database communication.

### Integration with Supabase

Supabase is used as the backend-as-a-service (BaaS) to:
- Handle authentication and user sessions
- Store user roles and project data
- Manage real-time project updates

---

## Deployment

- The application is hosted and deployed using **Azure** under a student subscription.
- CI/CD setup  can be added later for automated deployment via GitHub Actions.

---

## Development Tools

- **GitHub** for version control and issue tracking
- **Trello** for backlog and sprint management
- **Jest** for unit testing and code coverage
- **Supabase CLI & Dashboard** for database and authentication management

---

## Setup Instructions

### Prerequisites

- Node.js (v20+)
- npm
- Supabase account and project
- Azure account (Student)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/university-research-platform.git

# Navigate into the project directory
cd university-research-platform

# Install dependencies
npm install

# Create a .env file and add Supabase credentials
touch .env
