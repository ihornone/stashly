'use client';

import * as React from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';

export const UserDropdown = () => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  if (!user) return null;

  const displayName =
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Користувач';
  const email = user.primaryEmailAddress?.emailAddress;
  const avatarUrl = user.imageUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-7.5 items-center justify-center rounded-xl ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer overflow-hidden border border-border/80 shadow-xs"
          aria-label="Меню користувача"
        >
          <Avatar className="size-full rounded-xl">
            <AvatarImage src={avatarUrl} alt={displayName} className="rounded-xl object-cover" />
            <AvatarFallback className="rounded-xl text-[11px] font-semibold bg-primary/10 text-primary">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-1.5 z-50 animate-in fade-in-50 zoom-in-95"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center gap-2.5 p-2.5">
          <Avatar className="size-9 rounded-xl border border-border/60 shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} className="rounded-xl object-cover" />
            <AvatarFallback className="rounded-xl text-xs font-semibold bg-primary/10 text-primary">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 overflow-hidden">
            <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
            {email && <p className="text-[11px] text-muted-foreground truncate">{email}</p>}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => openUserProfile()}
            className="rounded-xl cursor-pointer text-xs font-medium py-2 px-2.5 focus:bg-accent focus:text-foreground flex items-center gap-2"
          >
            <User className="size-3.5 text-muted-foreground shrink-0" />
            <span>Керування акаунтом</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: '/' })}
          className="rounded-xl cursor-pointer text-xs font-medium py-2 px-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="size-3.5 shrink-0" />
          <span>Вийти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
