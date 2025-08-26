import React, { useEffect, useState } from "react";

import io from "socket.io-client";

import AuthPage from "./pages/AuthPage";

import Navbar from "./components/Navbar";

// ✅ Connect socket to backend

const socket = io("http://localhost:5000"); // change to your backend URL

const App = () => {

  // ✅ Typing indicator state

  const [typingUsers, setTypingUsers] = useState(new Set());

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {

    // Debugging: connection log

    socket.on("connect", () => {

      console.log("✅ Connected to socket:", socket.id);

    });

    // Listen for typing events

    socket.on("user-typing", ({ channelId, user }) => {

      console.log(`${user} is typing in ${channelId}...`);

      setTypingUsers((prev) => new Set([...prev, user]));

    });

    socket.on("user-stopped-typing", ({ channelId, user }) => {

      console.log(`${user} stopped typing in ${channelId}`);

      setTypingUsers((prev) => {

        const newSet = new Set(prev);

        newSet.delete(user);

        return newSet;

      });

    });

    // ✅ Handle user authentication for typing indicators

    socket.on("user-authenticated", ({ user }) => {

      setCurrentUser(user);

      console.log("User set for typing indicators:", user);

    });

    return () => {

      socket.off("connect");

      socket.off("user-typing");

      socket.off("user-stopped-typing");

      socket.off("user-authenticated");

    };

  }, []);

  // ✅ Helper functions for typing indicators

  const emitTyping = (channelId = "general") => {

    if (currentUser && socket.connected) {

      socket.emit("typing-start", { channelId, user: currentUser });

    }

  };

  const emitStopTyping = (channelId = "general") => {

    if (currentUser && socket.connected) {

      socket.emit("typing-stop", { channelId, user: currentUser });

    }

  };

  return (

    <div>

      {/* ✅ Connection + typing debug overlay (only in dev) */}

      {process.env.NODE_ENV === "development" && (

        <div className="fixed top-2 right-2 z-50 bg-black/50 text-white p-2 rounded text-xs">

          Socket: {socket.connected ? "🟢 Connected" : "🔴 Disconnected"}

          {typingUsers.size > 0 && (

            <div>Typing: {Array.from(typingUsers).join(", ")}</div>

          )}

        </div>

      )}

      <Navbar />

      <AuthPage

        socket={socket}

        typingUtils={{ emitTyping, emitStopTyping, typingUsers, setCurrentUser }}

      />

    </div>

  );

};

export default App;