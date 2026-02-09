import React from 'react';

interface MacBadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
    className?: string;
}

export const MacBadge: React.FC<MacBadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        success: "bg-green-100/80 text-green-700 border-green-200",
        warning: "bg-yellow-100/80 text-yellow-700 border-yellow-200",
        error: "bg-red-100/80 text-red-700 border-red-200",
        info: "bg-blue-100/80 text-blue-700 border-blue-200",
        neutral: "bg-slate-100/80 text-slate-600 border-slate-200",
        purple: "bg-purple-100/80 text-purple-700 border-purple-200"
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm shadow-sm ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
