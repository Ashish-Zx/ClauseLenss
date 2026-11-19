"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/brand-logo";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/documents", label: "Documents", icon: FileText },
] as const;

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const activeTheme = mounted ? theme : "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          {activeTheme === "dark" ? (
            <Moon className="size-4" />
          ) : activeTheme === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Monitor className="size-4" />
          )}
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Brand({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn(
        "flex items-center",
        compact ? "justify-center" : "min-w-0 gap-2.5 px-2",
      )}
    >
      <BrandLogo compact={compact} className={compact ? undefined : "h-9 w-full max-w-[200px] min-w-0"} />
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <div className="mb-3 pt-1">
        <Brand onNavigate={onNavigate} />
      </div>
      <Separator className="mb-2" />
      <div className="flex-1 overflow-y-auto">
        <NavList onNavigate={onNavigate} />
      </div>
      <Separator className="my-2" />
      <ThemeToggle />
    </div>
  );
}

type SidebarMode = "expanded" | "collapsed" | "hidden";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<SidebarMode>("expanded");
  const [width, setWidth] = useState(256);

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    const move = (ev: PointerEvent) => {
      const next = Math.min(380, Math.max(200, startW + (ev.clientX - startX)));
      setWidth(next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const desktopSidebarVisible = mode !== "hidden";

  return (
    <div className="flex min-h-dvh w-full">
      {/* Floating restore button when hidden */}
      {!desktopSidebarVisible && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode("expanded")}
          aria-label="Show sidebar"
          className="fixed left-3 top-3 z-30 hidden gap-1.5 shadow-sm md:inline-flex"
        >
          <PanelLeftOpen className="size-4" />
          Sidebar
        </Button>
      )}

      {/* Desktop sidebar */}
      {desktopSidebarVisible && (
        <aside
          className={cn(
            "relative sticky top-0 hidden h-dvh shrink-0 border-r bg-sidebar md:flex md:flex-col",
            mode === "collapsed" && "items-center",
          )}
          style={{ width: mode === "collapsed" ? 68 : width }}
        >
          {mode === "collapsed" ? (
            <div className="flex h-full w-full flex-col items-center gap-2 p-3">
              <div className="py-2">
                <Brand compact />
              </div>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode("expanded")}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-1 p-3 pb-2">
                <div className="min-w-0 flex-1">
                  <Brand />
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMode("collapsed")}
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="size-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <NavList />
              </div>
              <Separator />
              <div className="p-3">
                <ThemeToggle />
              </div>
              {/* Resize handle */}
              <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={startResize}
                className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize touch-none transition-colors hover:bg-primary/25 active:bg-primary/40"
              />
            </>
          )}
        </aside>
      )}

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center">
          <BrandLogo className="h-7 w-[155px]" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <PanelLeftOpen className="size-5" />
        </Button>
      </div>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r bg-sidebar shadow-xl">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <PanelLeftClose className="size-5" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
