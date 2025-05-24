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
 3. npm install express-session
 4. node src/server.js

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
