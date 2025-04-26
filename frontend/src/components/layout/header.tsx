"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <span className="text-primary">Readsy</span>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Início
          </Link>
          <Link
            href="/books"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Livros
          </Link>
          <Link
            href="/challenges"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Desafios
          </Link>
          <Link
            href="/groups"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Grupos
          </Link>
        </nav>

        {/* User Menu (Desktop) */}
        {user && (
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 py-1.5"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.displayName}
                    />
                    <AvatarFallback>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-right md:hidden bg-background",
            {
              hidden: !isOpen,
            }
          )}
        >
          <div className="flex flex-col space-y-4">
            <Link
              href="/dashboard"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link
              href="/books"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Livros
            </Link>
            <Link
              href="/challenges"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Desafios
            </Link>
            <Link
              href="/groups"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Grupos
            </Link>
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                href="/profile"
                className="flex items-center text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-2 h-5 w-5" />
                <span>Perfil</span>
              </Link>
              <Button
                variant="ghost"
                className="flex items-center mt-4 w-full justify-start px-0 text-lg hover:text-destructive transition-colors"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 