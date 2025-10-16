import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgot = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/reset-password", { state: { email } });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-[#008080]">Forgot Password</h1>
        <p className="text-sm text-gray-500">Enter your email to reset password</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleForgot} className="space-y-4">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" isLoading={isLoading}>Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordPage;
