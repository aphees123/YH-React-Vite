import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
//import { Card, CardHeader, CardContent, Button, Input } from "../../components/ui";

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // fake success
    setTimeout(() => {
      setIsLoading(false);
      navigate("/agents");
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-[#008080]">Verify OTP</h1>
        <p className="text-sm text-gray-500">We sent an OTP to {email}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <Button type="submit" isLoading={isLoading}>Verify</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OtpPage;
