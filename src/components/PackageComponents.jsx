import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
    const statusStyles = {
        'active': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
        'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3" /> },
        'inactive': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-3 w-3" /> },
        'approved': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    };
    const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            {style.icon}
            {status}
        </span>
    );
};

export const TitleBadge = ({ title }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
        {title}
    </span>
);