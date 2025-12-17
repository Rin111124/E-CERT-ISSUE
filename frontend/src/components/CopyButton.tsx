import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

type Props = {
    value: string;
    className?: string;
};

export function CopyButton({ value, className }: Props) {
    const [copied, setCopied] = useState(false);

    const doCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <button
            onClick={doCopy}
            className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-xs hover:border-[hsl(var(--primary))]",
                className
            )}
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
}
