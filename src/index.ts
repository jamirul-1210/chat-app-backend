import http from 'http';
import app from "./app";
import { configureSocket } from './socket';
import { connectToDatabase } from './config/database';
import dotenv from 'dotenv'

// load envs
dotenv.config()

// Initialize the app and HTTP server
const server = http.createServer(app);

// Configure Socket.IO
configureSocket(server);

// Connect to the database and start the server
const PORT = process.env.PORT || 3000;


// Connect to the database and start the server
connectToDatabase()

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
