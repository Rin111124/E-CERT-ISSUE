import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export function StudentLayout({ children }: { children: ReactNode }) {
    const links = [
        { to: "/student/certificates", label: "My Certificates" },
        { to: "/student/claim", label: "Claim" },
    ];
    return (
        <div className="min-h-screen">
            <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur">
                <div className="container-shell flex items-center gap-3">
                    <div className="text-lg font-semibold">Student Portal</div>
                    <nav className="flex items-center gap-2 text-sm ml-auto">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                className={({ isActive }) => cn("px-3 py-2 rounded-lg", isActive && "bg-[hsl(var(--border))]")}
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>
            <main className="container-shell space-y-4">{children}</main>
        </div>
    );
}
