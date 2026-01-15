'use client';

import { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (score: number) => void;
}

export default function PasswordStrength({ password, onStrengthChange }: PasswordStrengthProps) {
  const [result, setResult] = useState<ReturnType<typeof zxcvbn> | null>(null);

  useEffect(() => {
    if (password.length === 0) {
      setResult(null);
      onStrengthChange?.(0);
      return;
    }

    const evaluation = zxcvbn(password);
    setResult(evaluation);
    onStrengthChange?.(evaluation.score);
  }, [password, onStrengthChange]);

  if (!password || password.length === 0) {
    return null;
  }

  if (!result) {
    return null;
  }

  const { score, feedback } = result;

  // Score: 0-4 (very weak to very strong)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];
  const strengthTextColors = [
    'text-red-600 dark:text-red-400',
    'text-orange-600 dark:text-orange-400',
    'text-yellow-600 dark:text-yellow-400',
    'text-blue-600 dark:text-blue-400',
    'text-green-600 dark:text-green-400',
  ];

  const strengthLabel = strengthLabels[score];
  const strengthColor = strengthColors[score];
  const strengthTextColor = strengthTextColors[score];
  const strengthPercentage = ((score + 1) / 5) * 100;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthColor} transition-all duration-300 ease-out`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${strengthTextColor} min-w-[70px]`}>
          {strengthLabel}
        </span>
      </div>

      {/* Feedback */}
      {(feedback.warning || feedback.suggestions.length > 0) && (
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {feedback.warning && (
            <p className="text-orange-600 dark:text-orange-400">⚠️ {feedback.warning}</p>
          )}
          {feedback.suggestions.map((suggestion, index) => (
            <p key={index}>💡 {suggestion}</p>
          ))}
        </div>
      )}

      {/* Minimum requirements indicator */}
      {password.length < 8 && (
        <p className="text-xs text-red-600 dark:text-red-400">
          ❌ Password must be at least 8 characters
        </p>
      )}
    </div>
  );
}
