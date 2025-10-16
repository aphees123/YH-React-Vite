import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

// --- ✅ 1. Updated imports from phosphor-react ---
import {
  SquaresFour,
  User,
  Users,
  UsersThree,
  Package,
  Star,
  YoutubeLogo,
  CurrencyDollar,
  FirstAidKit,
  Folder,
  SignOut,
  CaretDown,
} from 'phosphor-react';

const YallaHajiLogo = () => (
  <img src="/vertical.svg" alt="Yalla Haji Logo" className="h-10 w-auto" />
)

// --- ✅ 2. Updated navItems with new Phosphor icons ---
const navItems = [
  
  { href: '/pilgrim-management', label: 'Pilgrim Management', icon: Users }, // Changed from lucide's UsersRound
  { href: '/team-management', label: 'Team Management', icon: UsersThree }, // Changed from lucide's Group
  {
    id: 'package-management',
    label: 'Package Management',
    icon: Package,
    subItems: [
      { href: '/package-management/package-list', label: 'Package List' },
      { href: '/package-management/state-list', label: 'State List' },
    ],
  },
  { href: '/feedback', label: 'Feedback Management', icon: Star }, // Changed from lucide's MessageSquare
  {
    id: 'content-management',
    label: 'Content Management',
    icon: YoutubeLogo, // Changed from lucide's Youtube
    subItems: [
      {
        href: '/content-management/arabic-phrases',
        label: "Arabic Phrases & Du'a",
      },
      {
        href: '/content-management/islamic-resources',
        label: 'Islamic Resources',
      },
    ],
  },
  {
    href: '/payment-management',
    label: 'Subscription and Payment Mangement',
    icon: CurrencyDollar, // Changed from lucide's CreditCard
  },
  {
    href: '/splash-screen',
    label: 'Splash Screen Management',
    icon: CurrencyDollar, // Changed from lucide's CreditCard, assuming same icon
  },
  { href: '/emergency', label: 'Emergency contact', icon: FirstAidKit }, // Changed from lucide's ShieldAlert
  {
    id: 'faqs-policy',
    label: "FAQ's and Policy",
    icon: Folder, // Changed from lucide's HelpCircle
    subItems: [
      { href: '/faqs-and-policy/management', label: "FAQ's Management" },
      { href: '/faqs-and-policy/child-policy', label: 'Child Policy' },
      { href: '/faqs-and-policy/privacy', label: 'Privacy Policy' },
    ],
  },
  { href: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  {
    id: 'agent-management',
    label: 'Agent Management',
    icon: User, // Changed from lucide's Users
    subItems: [
      { href: '/agents/list-view', label: 'Agents list view' },
      { href: '/agents/document-management', label: 'Document management' },
    ],
  }
]

export const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const handleMenuToggle = id => {
    setOpenMenu(openMenu === id ? '' : id)
  }

  const handleLogoutClick = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userData')
    navigate('/login')
    window.location.reload()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r flex flex-col font-baskerville">
      <div className="p-6 border-b">
        <YallaHajiLogo />
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(item =>
          item.subItems ? (
            <div key={item.id}>
              <button
                onClick={() => handleMenuToggle(item.id)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.subItems.some(sub =>
                    location.pathname.startsWith(sub.href)
                  )
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {/* ✅ 3. Replaced ChevronDown */}
                <CaretDown
                  className={`h-4 w-4 transition-transform ${
                    openMenu === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openMenu === item.id && (
                <div className="mt-1 flex flex-col space-y-1">
                  {item.subItems.map(subItem => (
                    <NavLink
                      key={subItem.href}
                      to={subItem.href}
                      className={({ isActive }) =>
                        `w-full flex items-center rounded-md pl-9 pr-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-teal-700 font-semibold'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`
                      }
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>
      <div className="mt-auto p-4 border-t">
        <Button
          onClick={handleLogoutClick}
          variant="ghost"
          className="w-full justify-start gap-3 mt-1 text-gray-900"
        >
          {/* ✅ 4. Replaced LogOut */}
          <SignOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}