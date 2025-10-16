import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
//import { Card, CardHeader, CardDescription, CardContent, Label, Input, Button } from "../../components/ui";


const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

const RoleSelector = ({ selectedRole, setSelectedRole }) => {
  const roles = ["Super Admin", "Moderator", "Content Manager"];
  return (
    <div className="flex items-center p-1 bg-gray-200 rounded-lg">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => setSelectedRole(role)}
          className={`w-full py-1.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-150 ${
            selectedRole === role
              ? "bg-[#008080] text-white shadow"
              : "text-gray-600 hover:bg-gray-300"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Super Admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const message = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to log in.");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Built for teams who want to work smarter, not harder.</CardDescription>
        <h1 className="mt-2 text-2xl font-bold text-[#008080]">Login</h1>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <RoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
          <div>
            <Label htmlFor="email">Email ID</Label>
            <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <Button type="submit" isLoading={isLoading}>Login</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
