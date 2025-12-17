import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

type ToastItem = { id: string; title: string; variant?: "info" | "success" | "error" };

type ToastContextValue = {
    toasts: ToastItem[];
    push: (title: string, variant?: ToastItem["variant"]) => void;
    dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const value = useMemo<ToastContextValue>(
        () => ({
            toasts,
            push: (title, variant = "info") => {
                const id = crypto.randomUUID();
                setToasts((prev) => [...prev, { id, title, variant }]);
                setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
            },
            dismiss: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
        }),
        [toasts]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "card px-3 py-2 shadow-lg flex items-center gap-2 border",
                            t.variant === "success" && "border-emerald-500/50",
                            t.variant === "error" && "border-rose-500/50"
                        )}
                    >
                        <span className="text-sm">{t.title}</span>
                        <button onClick={() => value.dismiss(t.id)} className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
