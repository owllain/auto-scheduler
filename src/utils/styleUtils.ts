export const getSupervisorStyle = (supervisorName: string) => {
    const name = supervisorName.toLowerCase();

    if (name.includes('enrique'))
        return 'border-l-4 border-l-blue-500';
    if (name.includes('junior'))
        return 'border-l-4 border-l-emerald-500';
    if (name.includes('kevin'))
        return 'border-l-4 border-l-purple-500';
    if (name.includes('yuliana'))
        return 'border-l-4 border-l-pink-500';

    return 'border-l-4 border-l-slate-300';
};

export const getSupervisorBadge = (supervisorName: string) => {
    const name = supervisorName.toLowerCase();

    if (name.includes('enrique')) return 'bg-blue-100 text-blue-700';
    if (name.includes('junior')) return 'bg-emerald-100 text-emerald-700';
    if (name.includes('kevin')) return 'bg-purple-100 text-purple-700';
    if (name.includes('yuliana')) return 'bg-pink-100 text-pink-700';

    return 'bg-slate-100 text-slate-600';
};