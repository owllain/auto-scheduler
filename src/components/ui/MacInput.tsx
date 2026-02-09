import React from 'react';

interface MacInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    wrapperClassName?: string;
}

export const MacInput: React.FC<MacInputProps> = ({ icon, className = '', wrapperClassName = '', ...props }) => {
    return (
        <div className={`relative group ${wrapperClassName}`}>
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#007AFF] transition-colors pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                className={`w-full bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-lg py-2 ${icon ? 'pl-10' : 'px-4'} pr-4 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] transition-all placeholder:text-slate-400/80 shadow-sm ${className}`}
                {...props}
            />
        </div>
    );
};
