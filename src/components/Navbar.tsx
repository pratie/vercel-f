'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleLogoClick = () => {
    if (user) {
      router.push('/projects');
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center gap-2 group cursor-pointer" onClick={handleLogoClick}>
              <div className="relative h-12 w-12">
                <Image 
                  src="/logo.png"
                  alt="SneakyGuy Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-[#ff4500] text-2xl font-bold tracking-tight">
                SNEAKYGUY
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 tracking-normal">{user.email}</span>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
