import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export function IssuerLayout({ children }: { children: ReactNode }) {
    const links = [
        { to: "/issuer/certificates", label: "Certificates" },
        { to: "/issuer/certificates/new", label: "New Certificate" },
    ];
    return (
        <div className="min-h-screen grid lg:grid-cols-[240px_1fr]">
            <aside className="border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3">
                <div className="text-lg font-semibold">Issuer Console</div>
                <nav className="flex flex-col gap-2 text-sm">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            className={({ isActive }) =>
                                cn(
                                    "px-3 py-2 rounded-lg hover:bg-[hsl(var(--border))]",
                                    isActive && "bg-[hsl(var(--border))]"
                                )
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="container-shell w-full space-y-4">{children}</main>
        </div>
    );
}
