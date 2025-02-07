"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const Email = process.env.NEXT_PUBLIC_EMAIL
    const Pasword = process.env.NEXT_PUBLIC_PASSWORD


    if (email === Email && password === Pasword) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Invalid email or password");
    }
    
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-black px-4 sm:px-6 lg:px-8">
      <form className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm" 
      onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          value={password}
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition duration-300"
        >
          Login 
        </button>
      </form>
    </div>
  );
}