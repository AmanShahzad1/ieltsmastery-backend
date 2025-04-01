# ieltsmastery-backend
# IELTS Mastery Platform - Backend

🔗 This repository contains the backend API of the IELTS Mastery Platform, handling user authentication, test management, performance tracking, and AI model communication.

## 🔍 Project Overview
This backend is responsible for:

✅ User authentication and session management.  
✅ Managing test data (writing, speaking, reading, listening).  
✅ Communicating with the AI-powered LLM server to provide real-time feedback.  
✅ Tracking user performance over time.  

## 🛠️ Tech Stack
- **Backend Framework:** Node.js (Express.js)  
- **Database:** PostgreSQL  
- **ORM:** Sequelize  
- **Authentication:** JWT & OAuth  
- **AI Model Integration:** Communicates with LLaMA 7B Versatile via the LLM Server  
- **Deployment:** Docker & Kubernetes  

## 🔗 API Endpoints
### 🚀 Authentication
- **POST** `/api/auth/register` – Register a new user
- **POST** `/api/auth/login` – Authenticate and get a JWT token

### 📊 User Progress
- **GET** `/api/users/:id/progress` – Retrieve user's learning analytics

### 📝 Writing Module
- **POST** `/api/writing/submit` – Submit an essay for AI feedback
- **GET** `/api/writing/:id/feedback` – Retrieve AI-generated feedback

### 🎤 Speaking Module
- **POST** `/api/speaking/submit` – Submit an audio clip for analysis
- **GET** `/api/speaking/:id/feedback` – Retrieve AI feedback

## 🚀 Installation & Setup
```bash
# Clone the repository
git clone https://github.com/AmanShahzad1/ieltsmastery-backend.git
cd ieltsmastery-backend

# Install dependencies
npm install

# Set up environment variables in a .env file
echo "DATABASE_URL=your_postgresql_url" >> .env
echo "JWT_SECRET=your_secret_key" >> .env

# Start the server
npm start
```
Backend runs at **http://localhost:5000**.

### 🔗 Related Repositories
- [IELTS Mastery Platform - Frontend](https://github.com/AmanShahzad1/ieltsmastery-main)
- [IELTS Mastery Platform - LLM Server](https://github.com/AmanShahzad1/ieltsMastery-LLM-Server)

## 🤝 Contributing
All contributions are welcome! Open an issue or submit a PR. 💡

