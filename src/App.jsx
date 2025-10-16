import React, { useState, useRef, useEffect } from 'react';
// --- NEW: Import React Router components and hooks ---
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import AgentManagementPage from './components/AgentManagementpage'
import AgentListPage from './components/AgentsListPage';
import AgentDetailsPage from './components/AgentsDetails';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Sidebar } from './components/layout/Sidebar';
import EmergencyMedicinePage from './components/EmergencyComponent'
import EditContactPage from './components/EditContactPage';
import ContactFormPage from './components/ContactFormPage'
import FaqManagementPage from './components/FaqManagementPage';
import FaqFormPage from './components/FaqFormPage';
import ChildPolicyManagementPage from './components/ChildPolicyManagementPage'
import ChildPolicyFormPage from './components/ChildPolicyFormPage';
import FeedbackListPage from './components/FeedbackListPage';
import FeedbackQuestionsPage from './components/FeedbackQuestionsPage';
import PackageManagement from './components/PackageManagement'
import ActivePackagesPage from './components/ActivePackagesPage';
import EditPackagePage from './components/EditPackagepage';
import PackageFormPage from './components/PackageFormPage';
import StateList from './components/StateList';
import StateFormPage from './components/StateFormPage'
import ProtectedRoute from './components/ProtectedRoute';
import { apiClient } from './utils/apiClient';
import ArabicPhrases from './components/content-management/ArabicPhrases';
import ArabicPhrasesForm from './components/content-management/ArabicPhrasesForm';
import ArabicPhrasesEditForm from './components/content-management/ArabicPhrasesEditForm'
import PiligrimManagement from './components/PiligrimManagement'
import Workinprogress from './components/Workinprogress';
import DuaasForm from './components/content-management/DuaasForm';
import DuaasEditForm from './components/content-management/DuaasEditForm';
import CreateSplashScreenCard from './components/CreateSplashScreenCard'
import IslamicResources from './components/content-management/IslamicResources';
import IslamicResourcesForm from './components/content-management/IslamicResourcesForm';
import IslamicResourcesEditForm from './components/content-management/IslamicResourcesEditForm';
import SplashscreenList from './components/SplashscreenManagement';
import CreateSplashScreen from './components/CreateSplashScreen'
import EditSplashScreenCard from './components/EditSplashScreenCard';
import EditSplashScreen from './components/EditSplashScreen';
// --- SVG Icons (No changes needed) ---
const YallaHajiLogo = () => (
    <img src="/image.png" alt="Yalla Haji Logo" className="mx-auto h-60 w-40" />
);

const EyeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);


// --- Styled Helper Components (No changes needed) ---
const Card = ({ children, className = '' }) => <div className={`bg-[#F9F6F1] rounded-2xl p-8 w-full max-w-md shadow-xl ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`mb-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h1 className={`text-3xl font-bold text-gray-800 ${className}`}>{children}</h1>;
const CardDescription = ({ children, className = '' }) => <p className={`text-[#008080] text-sm ${className}`}>{children}</p>;
const CardContent = ({ children, className = '' }) => <div className={`space-y-4 ${className}`}>{children}</div>;
const CardFooter = ({ children, className = '' }) => <div className={`mt-6 ${className}`}>{children}</div>;
const Label = ({ children, htmlFor, className = '' }) => <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>{children}</label>;
const Input = React.forwardRef((props, ref) => <input {...props} ref={ref} className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080] ${props.className || ''}`} />);
const Button = ({ children, className = '', isLoading, ...props }) => (
    <button
        {...props}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-300 bg-[#008080] hover:bg-[#006666] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008080] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
        disabled={isLoading}
    >
        {isLoading ? <Loader /> : children}
    </button>
);
const Loader = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const API_BASE_URL = 'http://backend-staging-alb-928761586.ap-southeast-2.elb.amazonaws.com';

// --- NEW: Auth Layout Component ---
// This component keeps the background and side panel consistent across all auth pages.
// The <Outlet /> component renders the specific child route (e.g., LoginPage, OtpPage).
const AuthLayout = () => {
    return (
        <main
            className="flex min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/Login 1.jpg')" }}
        >
            <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12 text-center text-[#008080]">
                <div className="z-10 relative lg:left-8">
                    <YallaHajiLogo />
                    <h1 className="mt-6 text-4xl  font-baskerville">Yalla Haji</h1>
                    <p className="mt-4 text-3xl md:text-4xl lg:text-2xl font-light tracking-tight font-baskerville">Built for growing teams</p>
                    <p className="mt-2 text-lg md:text-l text-[#006666] font-baskerville">Your work. Simplified</p>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
                <Outlet /> {/* Child routes will be rendered here */}
            </div>
        </main>
    );
};

// --- Main Application Component ---
function App() {
    // We no longer need the 'view' state, as the URL will now control the view.
    return (
        <Routes>
            {/* --- AUTH ROUTES (No changes here) --- */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-otp" element={<OtpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/side" element={<Sidebar />} />

                    {/* --- NEW AGENT ROUTES --- */}
                    {/* Route for the list of agents */}
                    <Route path="/agents" element={<AgentListPage />} />

                    {/* Route for a single agent's details. The ':agentId' is a dynamic parameter. */}
                    <Route path="/agents/:agentId" element={<AgentDetailsPage />} />
                    <Route path="/content-management/arabic-phrases" element={<ArabicPhrases />} />
                    <Route path="/content-management/arabic-phrases/create" element={<ArabicPhrasesForm />} />
                    <Route path="/content-management/arabic-phrases/edit/:phraseId" element={<ArabicPhrasesEditForm />} />

                    <Route path="/content-management/duaas/create" element={<DuaasForm />} />
                    <Route path="/content-management/duaas/edit/:duaId" element={<DuaasEditForm />} />

                    <Route path="/content-management/islamic-resources" element={<IslamicResources />} />
                    <Route path="/content-management/islamic-resources/create" element={<IslamicResourcesForm />} />
                    <Route path="/content-management/islamic-resources/edit/:guidelineId" element={<IslamicResourcesEditForm />} />
                    <Route path="/emergency" element={< EmergencyMedicinePage />} />
                    <Route path="/emergency-and-telemedicine" element={<EmergencyMedicinePage />} />
                    <Route path="/emergency-and-telemedicine/create" element={<ContactFormPage />} />
                    <Route path="/emergency-and-telemedicine/edit/:contactId" element={<EditContactPage />} />
                    <Route path="/faqs-and-policy/management" element={<FaqManagementPage />} />
                    <Route path="/faqs-and-policy/create" element={<FaqFormPage />} />
                    <Route path="/faqs-and-policy/edit/:faqId" element={<FaqFormPage />} />
                    <Route path="/package-management/package-list" element={<PackageManagement />} />
                    <Route path="/active-packages" element={<ActivePackagesPage />} />
                    <Route path="/packages/edit/:packageId" element={<EditPackagePage />} />
                    <Route path="/package-form/create" element={<PackageFormPage />} />
                    <Route path="/state-list/create" element={<StateFormPage />} />
                    <Route path="/state-list/edit/:stateId" element={<StateFormPage />} />
                    <Route path="/package-form/:packageId" element={<PackageFormPage />} />
                    <Route path="/faqs-and-policy/child-policy" element={<ChildPolicyManagementPage />} />
                    {/* This single route handles BOTH create and edit for the child policy */}
                    <Route path="/faqs-and-policy/child-policy/form" element={<ChildPolicyFormPage />} />
                    <Route path="/faqs-and-policy/child-policy" element={<ChildPolicyManagementPage />} />
                    <Route path="/package-management/state-list" element={<StateList />} />
                    <Route path="/faqs-and-policy/child-policy/form" element={<ChildPolicyFormPage />} />
                    <Route path="/feedback" element={<FeedbackListPage />} />
                    <Route path="/splash-screen/edit/:id" element={<EditSplashScreen />} />
                    <Route 
          path="/splash-screen/:splashId/create-card" 
          element={<CreateSplashScreenCard />} 
        />
                    <Route path="/feedback/questions" element={<FeedbackQuestionsPage />} />
                    <Route 
          path="/splash-screen/:splashId/edit-card/:cardId" 
          element={<EditSplashScreenCard />} 
        />
                    <Route path="/pilgrim-management" element={<PiligrimManagement />} />
                    <Route path="/splash-screen" element={<SplashscreenList />} />
                     <Route path="/payment-management" element={<Workinprogress/>} />
                      <Route path="/team-management" element={<Workinprogress/>} />
                       <Route path="/dashboard" element={<Workinprogress/>} />
                      <Route path="/team-management" element={<Workinprogress/>} />
                      <Route path="/faqs-and-policy/privacy" element={<Workinprogress/>} />
                    <Route path="/splash-screen/create-card/:splashId" element={<CreateSplashScreen />} />
                    {/* You might want a default dashboard route here later */}
                    {/* <Route path="/dashboard" element={<DashboardHome />} /> */}
                </Route>
            </Route>
        </Routes>
    );
}

// --- View Components ---
// Note: We moved the API logic and state management (isLoading, error, etc.)
// directly into the components that use them. This makes them more self-contained.

const RoleSelector = ({ selectedRole, setSelectedRole }) => {
    const roles = ['Super Admin', 'Moderator', 'Content Manager'];
    return (
        <div className="flex items-center p-1 bg-gray-200 rounded-lg">
            {roles.map(role => (
                <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`w-full py-1.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-150 ${selectedRole === role ? 'bg-[#008080] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    {role}
                </button>
            ))}
        </div>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // To check for messages from other pages (like a successful password reset)

    // State is now local to the component
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Super Admin');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if we were redirected here with a success message
    const message = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to log in.');

            // On success, navigate to the OTP page and pass the email in the state
            navigate('/verify-otp', { state: { email } });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardDescription className='font-baskerville'>Built for teams who want to work smarter, not harder.</CardDescription>
                <h1 className="mt-2 text-2xl font-bold text-[#008080] font-baskerville">Login</h1>
            </CardHeader>
            <CardContent>
                {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <RoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
                    <div>
                        <Label htmlFor="email">Email ID</Label>
                        <Input id="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400">
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                    <div className="flex flex-col space-y-2 text-center sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
                        <div className="flex items-center justify-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#008080] focus:ring-[#006666] border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                        </div>
                        <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-[#008080] hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                    <Button type="submit" isLoading={isLoading}>Login</Button>
                </form>
            </CardContent>
        </Card>
    );
};

const OtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get the email passed from the login page
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // If a user lands on this page without an email (e.g., direct URL access), redirect them.
    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            // Using your original fetch logic for login/otp is fine, or you can switch to apiClient
            const data = await apiClient('/users/verify-admin-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otpCode: otp }),
            });
            // const data = await response.json();
            // if (!response.ok) throw new Error(data.message || 'Invalid OTP.');

            const { user, token, refreshToken } = data.data;

            // ✅ SAVE BOTH TOKENS AND USER DATA
            localStorage.setItem('userData', JSON.stringify(user));
            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refreshToken);

            // Navigate to a default dashboard page
            navigate('/faqs-and-policy/management');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="relative mb-6">
                <button onClick={() => navigate('/login')} className="absolute left-0 top-1 flex items-center text-sm text-gray-600 hover:text-[#008080]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                    Back
                </button>
            </div>
            <CardHeader className="text-center">
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription className="mt-2">A 5-digit verification code has been sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
                {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <OtpInput otp={otp} setOtp={setOtp} />
                    <Button type="submit" isLoading={isLoading}>Verify OTP</Button>
                </form>
            </CardContent>
        </Card>
    );
};

const OtpInput = ({ otp, setOtp }) => {
    const inputsRef = useRef([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp.join(''));

        if (value && index < 4) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        if (paste.length === 5 && !isNaN(paste)) {
            setOtp(paste);
            inputsRef.current.forEach((input, i) => {
                if (input) input.value = paste[i] || '';
            });
            inputsRef.current[4]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {Array(5).fill("").map((_, index) => (
                <Input
                    key={index}
                    ref={el => inputsRef.current[index] = el}
                    type="text"
                    maxLength="1"
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold border-gray-300 focus:border-[#008080] focus:ring-[#008080]"
                    value={otp[index] || ""}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                />
            ))}
        </div>
    );
};


const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/forgot-admin-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not process request.');

            setMessage(data.data.message || 'An OTP has been sent to reset your password.');
            // Navigate to the reset page on success, passing the email
            setTimeout(() => navigate('/reset-password', { state: { email } }), 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription className='mt-5'>Enter the email of your account and we will send an email to reset your password.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                        <Label htmlFor="email-forgot">Email ID</Label>
                        <Input id="email-forgot" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <Button type="submit" isLoading={isLoading}>Send OTP</Button>
                </form>
            </CardContent>
            <CardFooter>
                <button onClick={() => navigate('/login')} className="text-sm text-[#008080] hover:underline w-full text-center">
                    Back to Login
                </button>
            </CardFooter>
        </Card>
    );
};

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from the previous page
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if email is missing
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);


    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/reset-admin-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpCode: otp, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to reset password.');

            // On success, navigate back to login with a success message
            navigate('/login', { state: { message: data.data.message || 'Password reset successfully. Please log in.' } });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>Enter the OTP and a new password.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <Label>OTP Code</Label>
                        <OtpInput otp={otp} setOtp={setOtp} />
                    </div>
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" isLoading={isLoading}>Reset Password</Button>
                </form>
            </CardContent>
            <CardFooter>
                <button onClick={() => navigate('/login')} className="text-sm text-[#008080] hover:underline w-full text-center">
                    Back to Login
                </button>
            </CardFooter>
        </Card>
    );
};


export default App;
