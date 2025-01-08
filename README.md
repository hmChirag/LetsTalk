# Let's Talk - Video Call Application

## Overview
**Let's Talk** is a real-time video call application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and leverages WebRTC for peer-to-peer communication. This application enables seamless video calling capabilities by using WebSockets for signaling, along with STUN servers and ICE candidates for establishing connections across NATs and firewalls.

## Features
- **Real-time Video Calls**: Direct peer-to-peer communication using WebRTC.
- **Instant Messaging**: Built-in chat functionality for seamless text communication during calls.
- **Screen Sharing**: Share your screen with other participants for better collaboration.
- **Authentication**: Secure user authentication and session management.
- **Signaling with WebSockets**: Ensures efficient message exchange between users for establishing connections.
- **NAT Traversal**: Uses STUN servers and ICE candidates to manage network configurations and ensure connectivity.
- **Cross-Platform Compatibility**: Works on modern web browsers across devices.
- **Simple UI**: Clean and intuitive user interface built with React.js.

## Technologies Used
### Frontend:
- **React.js**
  - React Router for navigation
  - Context API for state management
  - WebRTC APIs for video and audio streams

### Backend:
- **Node.js** with **Express.js**
  - WebSocket server for signaling
  - REST APIs for user and session management

### Database:
- **MongoDB** for storing user details and session information

### Real-Time Communication:
- **WebRTC** for peer-to-peer video and audio calls
- **STUN Servers** for NAT traversal
- **ICE Framework** to find the best path for communication

## Installation
### Prerequisites:
- Node.js (v16+)
- MongoDB (local or cloud-based instance)

### Steps to Run Locally:
1. **Clone the repository:**
   ```bash
   git clone https://github.com/hmChirag/LetsTalk
   cd lets-talk
   ```
2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the `backend` directory and add:
     ```env
     PORT=5000
     MONGO_URI=<your-mongodb-connection-string>
     STUN_SERVER=<your-stun-server-url>
     ```
4. **Run the backend server:**
   ```bash
   cd backend
   npm start
   ```
5. **Run the frontend server:**
   ```bash
   cd frontend
   npm start
   ```
6. Open the app in your browser at [http://localhost:3000](http://localhost:8000).

## Project Structure
```
lets-talk/
|-- backend/        # Backend server files (Node.js + Express.js)
|   |-- models/     # MongoDB models
|   |-- routes/     # API routes
|   |-- server.js   # Entry point for backend
|
|-- frontend/       # Frontend files (React.js)
    |-- public/     # Static files
    |-- src/        # Source files
        |-- components/ # React components
        |-- pages/      # Page-level components
        |-- App.js      # Main app component
```

## How It Works
1. **Signaling**: 
   - WebSockets handle the exchange of signaling data (offer, answer, ICE candidates) between users.

2. **Connection Establishment**: 
   - STUN servers help discover public-facing IPs, enabling users behind NATs to connect.
   - ICE candidates identify the optimal network path for communication.

3. **Media Exchange**: 
   - WebRTC APIs handle the transfer of video and audio streams between peers.

## Future Improvements
- Add group call functionality.
- Integrate TURN servers for enhanced connectivity in restrictive networks.
- Enable more advanced chat features (e.g., media sharing).
- Develop a mobile-friendly interface.

## Contributions
Contributions are welcome! Feel free to open issues or submit pull requests.

## License
This project is licensed under the [MIT License](LICENSE).

---

**Happy Coding!**

![image](https://github.com/user-attachments/assets/ca6e7e22-3f3e-4ef6-ab62-10ebfd7e2230)

