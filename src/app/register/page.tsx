'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TempoIcon } from '@/components/icons/TempoIcon';
import { Check, X } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'info' | 'verify'>('info');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);

    // Password strength checker
    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[a-z]/.test(pass)) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^a-zA-Z0-9]/.test(pass)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSendCode = async () => {
        if (!email) return;
        setIsSendingCode(true);
        // Simulate sending code
        setTimeout(() => {
            setIsSendingCode(false);
            setStep('verify');
        }, 1500);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch || passwordStrength < 2) return;
        setIsLoading(true);
        // Simulate register delay
        setTimeout(() => {
            setIsLoading(false);
            router.push('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <TempoIcon />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
                    <p className="text-gray-500 text-sm">Start your journey to better focus.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleRegister} className="space-y-5">
                        {step === 'info' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-purple-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="flex-1 px-4 py-3 bg-purple-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={!email || isSendingCode}
                                            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isSendingCode ? 'Sending...' : 'Send Code'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-purple-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        required
                                    />
                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[0, 1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs ${passwordStrength <= 1 ? 'text-red-500' :
                                                    passwordStrength <= 2 ? 'text-orange-500' :
                                                        passwordStrength <= 3 ? 'text-blue-500' : 'text-green-500'
                                                }`}>
                                                {strengthLabels[passwordStrength - 1] || 'Enter password'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-purple-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
                                            required
                                        />
                                        {confirmPassword && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {passwordsMatch ? (
                                                    <Check size={20} className="text-green-500" />
                                                ) : (
                                                    <X size={20} className="text-red-500" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    {confirmPassword && !passwordsMatch && (
                                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                    )}
                                </div>
                            </>
                        )}

                        {step === 'verify' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP Code
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    We sent a 6-digit code to {email}
                                </p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full px-4 py-3 bg-purple-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center text-2xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setStep('info')}
                                    className="text-purple-600 text-sm mt-3 hover:underline"
                                >
                                    ← Back to edit info
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || (step === 'info' && (!passwordsMatch || passwordStrength < 2)) || (step === 'verify' && otp.length !== 6)}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Loading...
                                </span>
                            ) : step === 'verify' ? (
                                'Verify & Create Account'
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-6 text-gray-500 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-purple-600 hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
