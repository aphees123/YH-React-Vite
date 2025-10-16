import React from 'react';
import { Search, Bell } from 'lucide-react';

// The component now accepts a 'title' prop.
// We've set a default value of "Dashboard" in case no title is provided.
const Header = ({ title = "Dashboard" }) => {
    return (
        <header className="bg-[#F0F7F7] flex items-center justify-between  pt-6 rounded-full">
            {/* Left Side: Title */}
            <h1 className="text-xl text-[#0A7777] font-baskerville">
                {/* ✅ The hardcoded text is replaced with the title prop */}
                {title}
            </h1>

            {/* Right Side: Search, Bell, Avatar */}
            <div className="flex items-center gap-5">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search anything here..."
                        className="bg-white rounded-full py-2 pl-5 pr-10 w-80 focus:outline-none focus:ring-2 focus:ring-[#0A7777]"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                {/* Bell Icon */}

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;