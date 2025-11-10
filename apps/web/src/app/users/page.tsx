"use client";
import { useState } from "react";

export default function UsersPage() {
  const [user, setUser] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
  e.preventDefault();
  if (name && email) {
    setUser(name);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
  }
};

  const handleSignOut = () => {
  setUser(null);
  setName("");
  setEmail("");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
};


  return (
    <div className="p-6">
      {!user ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sign In / Sign Up</h2>
          <form onSubmit={handleSignIn} className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Continue
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Welcome, {user} 👋</h2>
          <p className="text-gray-500 mb-4">You are signed in.</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
