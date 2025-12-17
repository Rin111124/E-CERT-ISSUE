import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen">
            <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur">
                <div className="container-shell flex items-center gap-3">
                    <NavLink to="/" className="text-lg font-semibold">CertChain</NavLink>
                    <nav className="flex items-center gap-3 text-sm ml-auto">
                        <NavLink className={({ isActive }) => cn("px-3 py-2 rounded-lg", isActive && "bg-[hsl(var(--border))]")} to="/verify">Verify</NavLink>
                        <NavLink className={({ isActive }) => cn("px-3 py-2 rounded-lg", isActive && "bg-[hsl(var(--border))]")} to="/issuer/certificates">Issuer</NavLink>
                        <NavLink className={({ isActive }) => cn("px-3 py-2 rounded-lg", isActive && "bg-[hsl(var(--border))]")} to="/student/certificates">Student</NavLink>
                    </nav>
                </div>
            </header>
            <main className="container-shell space-y-4">{children}</main>
        </div>
    );
}
