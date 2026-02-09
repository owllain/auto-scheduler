import React from 'react';

interface MacButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const MacButton: React.FC<MacButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
        primary: "bg-[#007AFF] hover:bg-[#0062CC] text-white shadow-md active:transform active:scale-[0.98] border border-transparent shadow-blue-500/20",
        secondary: "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/60 shadow-sm backdrop-blur-sm active:bg-slate-50",
        destructive: "bg-[#FF3B30] hover:bg-[#D63025] text-white shadow-md active:scale-[0.98] shadow-red-500/20",
        ghost: "bg-transparent hover:bg-black/5 text-slate-700 active:bg-black/10",
        outline: "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50"
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5 rounded-lg",
        md: "text-sm px-4 py-2 rounded-lg",
        lg: "text-base px-6 py-3 rounded-xl",
        icon: "p-2 rounded-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
