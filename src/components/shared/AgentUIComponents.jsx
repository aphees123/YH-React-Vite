import React from 'react';
import { Star, ShieldCheck, ShieldX, Search, File as FileIcon, Eye as EyeIconLucide, ChevronLeft, Download, Edit, FileText } from 'lucide-react';

// --- Reusable UI Components ---

export const Input = React.forwardRef((props, ref) => <input {...props} ref={ref} className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080] ${props.className || ''}`} />);

export const StatusBadge = ({ status }) => {
    const styles = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Verified': 'bg-green-100 text-green-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
};

export const SubscriptionBadge = ({ tier }) => {
    const styles = {
        'Gold': 'bg-yellow-400 text-white',
        'Silver': 'bg-gray-400 text-white',
        'Platinum': 'bg-fuchsia-500 text-white',
    };
    const Icon = {
        'Gold': Star,
        'Silver': ShieldCheck,
        'Platinum': ShieldX,
    }[tier] || Star;

    return (
         <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${styles[tier] || 'bg-gray-200 text-gray-800'}`}>
            <Icon className="h-3 w-3" />
            {tier || 'N/A'}
        </span>
    );
};

// Export icons you might need in other files
export { Search, FileIcon, EyeIconLucide, ChevronLeft, Download, Edit, FileText };