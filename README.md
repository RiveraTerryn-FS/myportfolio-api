# My Blog & Portfolio

## Backend Setup

Create a file named `.env` inside the backend folder with the following:

    PORT=3001
    MONGO_URL=mongodb://127.0.0.1:27017/myblogandportfolio
    JWT_SECRET="SecretKey123"
    REFRESH_SECRET="SecretKey321"
    CLIENT_URL="http://localhost:3000"
    NODE_ENV="development"

Start backend:

    npm install
    npm run dev