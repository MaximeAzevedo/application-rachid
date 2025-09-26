'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Accueil',
    icon: '🏠',
    path: '/dashboard',
    color: 'bg-green-600'
  },
  {
    id: 'classes',
    label: 'Classes',
    icon: '📚',
    path: '/admin/classes',
    color: 'bg-blue-500'
  },
  {
    id: 'students',
    label: 'Élèves',
    icon: '👥',
    path: '/admin/students',
    color: 'bg-pink-500'
  }
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Déterminer l'onglet actif basé sur le pathname
    const currentTab = navItems.find(item => 
      pathname.startsWith(item.path)
    );
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.id);
    router.push(item.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-100 shadow-2xl z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`
                flex flex-col items-center justify-center
                min-w-[80px] h-16 rounded-2xl
                transition-all duration-300 ease-out
                touch-manipulation select-none
                ${isActive 
                  ? `${item.color} scale-110 shadow-lg -translate-y-1` 
                  : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                }
              `}
              style={{
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div className={`
                text-2xl mb-1 transition-all duration-300
                ${isActive ? 'scale-110' : 'scale-100'}
              `}>
                {item.icon}
              </div>
              <span className={`
                text-xs font-bold transition-all duration-300
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-600'
                }
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Indicateur visuel de l'onglet actif */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-pink-500"></div>
    </div>
  );
} 