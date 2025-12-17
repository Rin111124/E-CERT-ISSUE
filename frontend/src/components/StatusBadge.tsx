import { cn } from "../lib/utils";
import { CertificateStatus } from "../types";

type Props = {
    status: CertificateStatus | string;
};

const colors: Record<string, string> = {
    DRAFT: "bg-slate-800 text-slate-100 border-slate-700",
    ISSUED: "bg-emerald-500/10 text-emerald-200 border-emerald-500/40",
    REVOKED: "bg-rose-500/10 text-rose-200 border-rose-500/40",
    DELIVERED: "bg-cyan-500/10 text-cyan-100 border-cyan-500/40",
    VALID: "bg-emerald-500/10 text-emerald-200 border-emerald-500/40",
};

export function StatusBadge({ status }: Props) {
    return (
        <span className={cn("badge border", colors[status] || "")}>{status}</span>
    );
}
