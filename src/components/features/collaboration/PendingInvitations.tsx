'use client';

import React from 'react';
import { Mail, Check, X, Clock } from 'lucide-react';
import { ProjectInvitation } from '@/types';

interface PendingInvitationsProps {
    invitations: ProjectInvitation[];
    onAccept: (token: string) => Promise<void>;
    onDecline: (token: string) => Promise<void>;
}

export default function PendingInvitations({
    invitations,
    onAccept,
    onDecline,
}: PendingInvitationsProps) {
    if (invitations.length === 0) return null;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const isExpired = (expiresAt: number) => {
        return Date.now() > expiresAt;
    };

    return (
        <div className="bg-white dark:bg-[#252540] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <Mail className="text-purple-600" size={22} />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Project Invitations
                </h2>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                    {invitations.length}
                </span>
            </div>

            <ul className="space-y-3">
                {invitations.map((invitation) => {
                    const expired = isExpired(invitation.expiresAt);

                    return (
                        <li
                            key={invitation.id}
                            className={`p-4 rounded-xl border transition-all ${expired
                                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                                    : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {invitation.projectName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock size={14} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {expired ? 'Expired' : `Expires on ${formatDate(invitation.expiresAt)}`}
                                        </span>
                                    </div>
                                </div>

                                {!expired && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onDecline(invitation.token)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                                            title="Decline invitation"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={() => onAccept(invitation.token)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Check size={18} />
                                            Accept
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
