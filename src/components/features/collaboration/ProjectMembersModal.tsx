'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Crown, X, Mail, Trash2, LogOut } from 'lucide-react';
import { ProjectMember, ProjectInvitation } from '@/types';

interface ProjectMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    members: ProjectMember[];
    pendingInvitations: ProjectInvitation[];
    currentUserId: string;
    isOwner: boolean;
    onInvite: (email: string) => Promise<void>;
    onRemoveMember: (userId: string) => Promise<void>;
    onLeaveProject: () => Promise<void>;
    onCancelInvitation: (invitationId: string) => Promise<void>;
    onTransferOwnership: (newOwnerId: string) => Promise<void>;
}

export default function ProjectMembersModal({
    isOpen,
    onClose,
    projectId,
    projectName,
    members,
    pendingInvitations,
    currentUserId,
    isOwner,
    onInvite,
    onRemoveMember,
    onLeaveProject,
    onCancelInvitation,
    onTransferOwnership,
}: ProjectMembersModalProps) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsInviting(true);
        setError(null);
        try {
            await onInvite(inviteEmail.trim());
            setInviteEmail('');
        } catch (err) {
            setError('Failed to send invitation');
        } finally {
            setIsInviting(false);
        }
    };

    const handleTransferOwnership = async (newOwnerId: string) => {
        try {
            await onTransferOwnership(newOwnerId);
            setShowTransferModal(false);
        } catch (err) {
            setError('Failed to transfer ownership');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#252540] rounded-2xl w-full max-w-lg shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Users className="text-purple-600" size={24} />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Members</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{projectName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Invite Section (Owner only) */}
                {isOwner && (
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Invite new member
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                    placeholder="colleague@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white text-sm"
                                />
                            </div>
                            <button
                                onClick={handleInvite}
                                disabled={isInviting || !inviteEmail.trim()}
                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                            >
                                <UserPlus size={18} />
                                {isInviting ? 'Sending...' : 'Invite'}
                            </button>
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">{error}</p>
                        )}
                    </div>
                )}

                {/* Members List */}
                <div className="p-5">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Members ({members.length})
                    </h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {members.map((member) => (
                            <li
                                key={member.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A2E] rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    {member.user.avatarUrl ? (
                                        <img
                                            src={member.user.avatarUrl}
                                            alt={member.user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                            {member.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {member.user.name}
                                            </span>
                                            {member.role === 'owner' && (
                                                <Crown size={14} className="text-yellow-500" />
                                            )}
                                            {member.userId === currentUserId && (
                                                <span className="text-xs text-purple-600 dark:text-purple-400">(You)</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {member.user.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${member.role === 'owner'
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {member.role}
                                    </span>

                                    {/* Remove member (owner can remove others, members can leave) */}
                                    {member.userId !== currentUserId && isOwner && member.role !== 'owner' && (
                                        <button
                                            onClick={() => onRemoveMember(member.userId)}
                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                                            title="Remove member"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                    {/* Transfer ownership button */}
                                    {isOwner && member.userId !== currentUserId && (
                                        <button
                                            onClick={() => handleTransferOwnership(member.userId)}
                                            className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 rounded-lg transition-colors"
                                            title="Transfer ownership"
                                        >
                                            <Crown size={16} />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pending Invitations */}
                {isOwner && pendingInvitations.length > 0 && (
                    <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Pending Invitations ({pendingInvitations.length})
                        </h3>
                        <ul className="space-y-2">
                            {pendingInvitations.map((invitation) => (
                                <li
                                    key={invitation.id}
                                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <Mail size={18} className="text-yellow-600" />
                                        <span className="text-sm text-gray-900 dark:text-white">{invitation.email}</span>
                                    </div>
                                    <button
                                        onClick={() => onCancelInvitation(invitation.id)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                                        title="Cancel invitation"
                                    >
                                        <X size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Leave Project Button (for members, not owner) */}
                {!isOwner && (
                    <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onLeaveProject}
                            className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <LogOut size={18} />
                            Leave Project
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
