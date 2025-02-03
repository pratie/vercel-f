'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // Get first letter of email for avatar
  const getInitial = (email: string) => {
    return email ? email[0].toUpperCase() : 'U';
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center gap-2 group cursor-pointer" onClick={handleLogoClick}>
              <span className="text-[#ff4500] text-2xl font-bold tracking-tight">
                SNEAKYGUY
              </span>
              <div className="relative h-12 w-11">
                <Image 
                  src="/logo.png"
                  alt="Sneakylogo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <span className="font-medium text-sm text-gray-700">
                      {getInitial(user.email)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/projects')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Projects</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                className="bg-[#ff4500] hover:bg-[#ff6634] text-white font-medium px-6"
              >
                Sign up
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
