'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Password requirements checker
    const passwordChecks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
    const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const strengthTextColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-blue-500', 'text-green-500'];

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const passwordValid = passwordStrength >= 4; // At least 4 requirements met

    // Username validation
    const usernameValid = /^[a-zA-Z][a-zA-Z0-9_.]{2,29}$/.test(username);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch || !passwordValid || !usernameValid) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex bg-purple-100">
            {/* Left Side - Illustration with Tabs */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-purple-500 to-purple-600 items-center justify-center p-12 relative overflow-visible rounded-r-[40px]">
                {/* Floating Tab Buttons */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col">
                    {/* Login Tab */}
                    <Link
                        href="/login"
                        className="text-white font-semibold px-10 py-4 text-lg hover:bg-white/20 rounded-full transition-all min-w-[140px] text-center"
                    >
                        Log in
                    </Link>
                    {/* Sign up Tab - Active */}
                    <Link
                        href="/register"
                        className="bg-white text-purple-600 font-semibold px-10 py-4 rounded-full shadow-lg text-lg mt-3 transition-all hover:scale-105 min-w-[140px] text-center"
                    >
                        Sign up
                    </Link>
                </div>

                {/* Illustration */}
                <div className="relative w-full max-w-sm animate-float">
                    <Image
                        src="/images/register-illustration.png"
                        alt="Register illustration"
                        width={350}
                        height={350}
                        className="w-full h-auto drop-shadow-2xl"
                        priority
                    />
                </div>

                {/* Decorative dots */}
                <div className="absolute top-10 right-24 grid grid-cols-4 gap-2 opacity-30 animate-pulse">
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                    ))}
                </div>
                <div className="absolute bottom-10 left-10 grid grid-cols-3 gap-2 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                    ))}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 lg:px-16 xl:px-20 bg-white py-8 overflow-y-auto">
                <div className="max-w-md w-full mx-auto">
                    {/* Header */}
                    <div className="mb-6 animate-fade-in-up">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
                        <p className="text-gray-500">Let&apos;s get started setting up your profile.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Username */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                                    placeholder="johndoe"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    maxLength={30}
                                    required
                                />
                            </div>
                            {username && !usernameValid && (
                                <p className="text-xs text-red-500 mt-1">Username must start with a letter, 3-30 chars</p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Strength & Requirements */}
                            {password && (
                                <div className="mt-3 space-y-2 animate-fade-in">
                                    {/* Strength bar */}
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-medium ${strengthTextColors[passwordStrength]}`}>
                                        {strengthLabels[passwordStrength]}
                                    </p>

                                    {/* Requirements checklist */}
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        <div className={`flex items-center gap-1 ${passwordChecks.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordChecks.minLength ? <Check size={12} /> : <X size={12} />}
                                            8+ characters
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordChecks.hasUppercase ? <Check size={12} /> : <X size={12} />}
                                            Uppercase (A-Z)
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordChecks.hasLowercase ? <Check size={12} /> : <X size={12} />}
                                            Lowercase (a-z)
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordChecks.hasNumber ? <Check size={12} /> : <X size={12} />}
                                            Number (0-9)
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordChecks.hasSpecial ? <Check size={12} /> : <X size={12} />}
                                            Special (!@#$...)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-20 transition-all"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {confirmPassword && (
                                        <span className="animate-scale-in">
                                            {passwordsMatch ? (
                                                <Check size={18} className="text-green-500" />
                                            ) : (
                                                <X size={18} className="text-red-500" />
                                            )}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !passwordsMatch || !passwordValid || !usernameValid}
                            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 animate-fade-in-up hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98]"
                            style={{ animationDelay: '0.3s' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        {/* Or divider */}
                        <div className="relative animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Google Register */}
                        <button
                            type="button"
                            className="w-full py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all flex items-center justify-center gap-3 animate-fade-in-up hover:shadow-md active:scale-[0.98]"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>
                </div>
            </div>

            {/* Mobile Tab Buttons */}
            <div className="lg:hidden fixed top-4 left-4 z-50 flex gap-2 animate-fade-in">
                <Link
                    href="/login"
                    className="bg-white text-purple-600 font-medium px-6 py-2 rounded-full text-sm border border-purple-200 shadow-lg"
                >
                    Log in
                </Link>
                <Link
                    href="/register"
                    className="bg-purple-600 text-white font-medium px-6 py-2 rounded-full text-sm shadow-lg"
                >
                    Sign up
                </Link>
            </div>

            {/* Custom animations */}
            <style jsx global>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
