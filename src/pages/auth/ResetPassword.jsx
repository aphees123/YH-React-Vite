import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardContent, Label, Input, Button } from "../../components/ui";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login", { state: { message: "Password reset successful. Please login." } });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-[#008080]">Reset Password</h1>
        <p className="text-sm text-gray-500">Reset password for {email}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReset} className="space-y-4">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" isLoading={isLoading}>Reset Password</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordPage;
