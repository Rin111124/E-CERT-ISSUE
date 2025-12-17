import { CopyButton } from "./CopyButton";
import { cn } from "../lib/utils";

type Props = {
    code: string;
    title?: string;
    className?: string;
};

export function CodeViewer({ code, title, className }: Props) {
    return (
        <div className={cn("card p-3 flex flex-col gap-2", className)}>
            <div className="flex items-center justify-between">
                <span className="section-title">{title || "Payload"}</span>
                <CopyButton value={code} />
            </div>
            <pre className="code-block">{code}</pre>
        </div>
    );
}
