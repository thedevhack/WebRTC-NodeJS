# 🧑‍💻 WebRTC 1-to-1 Video Calling App

This is a peer-to-peer video calling web application built using **React**, **Node.js**, **WebRTC**, and **Socket.IO**. It allows two users to join a room and have a live video chat with device switching support (camera/mic) and safe disconnection handling.

---

## 📸 Features

- 1-to-1 real-time video and audio calling
- WebRTC-based peer-to-peer communication
- Camera and microphone device selection
- Mute/unmute camera and mic
- Automatically handles browser tab closing and manual leave
- Built using only **vanilla WebRTC** and **Socket.IO** (no third-party SDKs)

---

## 🏗️ Tech Stack

| Frontend | Backend | Real-time |
|----------|---------|-----------|
| React + MUI | Node.js (Express) | Socket.IO |
| WebRTC API |             | WebSockets |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/thedevhack/WebRTC-NodeJS.git
cd WebRTC-NodeJS
```

### 🔌 2. Start the Backend Server

```bash
cd server
npm install
node ./index.js
```


### 💻 3. Start the Frontend (React App)

```bash
cd client/gmmet_frontend
npm install
npm run dev
```

## 🎉 You're Live!
Visit http://localhost:5173 in two browser tabs or two devices and see it in action!(make sure both tabs have same meeting id)

> ⚠️ **Note:**  
> This project currently supports **only 1-to-1 video calling**.  
> 
> If more than 2 users join the same room:
> - The app may behave unexpectedly.
> - WebRTC connection logic might break.
> - There are no safeguards for additional peers.
