'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X, ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

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
    const passwordValid = passwordStrength >= 4;

    const handleSendCode = async () => {
        if (!email) return;
        setIsLoading(true);
        // Simulate sending code
        setTimeout(() => {
            setIsLoading(false);
            setCodeSent(true);
            setStep('code');
        }, 1500);
    };

    const handleVerifyCode = async () => {
        if (code.length !== 6) return;
        setIsLoading(true);
        // Simulate verifying code
        setTimeout(() => {
            setIsLoading(false);
            setStep('password');
        }, 1000);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch || !passwordValid) return;
        setIsLoading(true);
        // Simulate password reset
        setTimeout(() => {
            setIsLoading(false);
            router.push('/login');
        }, 1000);
    };

    const getStepIcon = () => {
        switch (step) {
            case 'email': return <Mail size={28} />;
            case 'code': return <KeyRound size={28} />;
            case 'password': return <ShieldCheck size={28} />;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 'email': return 'Forgot Password?';
            case 'code': return 'Enter Verification Code';
            case 'password': return 'Create New Password';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 'email': return "No worries! Enter your email and we'll send you a reset code.";
            case 'code': return `We've sent a 6-digit code to ${email}`;
            case 'password': return 'Your new password must be different from previously used passwords.';
        }
    };

    return (
        <div className="min-h-screen flex bg-purple-100">
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-purple-500 to-purple-600 items-center justify-center p-12 relative overflow-hidden rounded-r-[40px]">
                {/* Step Indicator */}
                <div className="absolute top-10 left-10 flex items-center gap-3">
                    {(['email', 'code', 'password'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === s ? 'bg-white text-purple-600' :
                                    (['email', 'code', 'password'].indexOf(step) > i) ? 'bg-white/80 text-purple-600' : 'bg-white/30 text-white'
                                }`}>
                                {i + 1}
                            </div>
                            {i < 2 && <div className={`w-8 h-0.5 mx-1 ${(['email', 'code', 'password'].indexOf(step) > i) ? 'bg-white/80' : 'bg-white/30'}`} />}
                        </div>
                    ))}
                </div>

                {/* Illustration */}
                <div className="relative w-full max-w-sm animate-float">
                    <Image
                        src="/images/register-illustration.png"
                        alt="Reset password illustration"
                        width={350}
                        height={350}
                        className="w-full h-auto drop-shadow-2xl"
                        priority
                    />
                </div>

                {/* Decorative dots */}
                <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-30 animate-pulse">
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
            <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-white">
                <div className="max-w-md w-full mx-auto">
                    {/* Back button */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors animate-fade-in"
                    >
                        <ArrowLeft size={20} />
                        Back to login
                    </Link>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 animate-fade-in-up">
                        {getStepIcon()}
                    </div>

                    {/* Header */}
                    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
                        <p className="text-gray-500">{getStepDescription()}</p>
                    </div>

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div>
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
                            <button
                                onClick={handleSendCode}
                                disabled={isLoading || !email}
                                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Code'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 'code' && (
                        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono transition-all"
                                    maxLength={6}
                                />
                            </div>
                            <button
                                onClick={handleVerifyCode}
                                disabled={isLoading || code.length !== 6}
                                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify Code'
                                )}
                            </button>
                            <button
                                onClick={() => setStep('email')}
                                className="w-full py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                            >
                                ← Change email
                            </button>
                            <p className="text-center text-sm text-gray-500">
                                Didn&apos;t receive the code?{' '}
                                <button onClick={handleSendCode} className="text-purple-600 hover:underline font-medium">
                                    Resend
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
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

                            <button
                                type="submit"
                                disabled={isLoading || !passwordsMatch || !passwordValid}
                                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Resetting...
                                    </span>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    )}
                </div>
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
