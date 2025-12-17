import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CopyButton } from "./CopyButton";

type Props = {
    value: string;
    label?: string;
};

export function QRCodeCard({ value, label }: Props) {
    const [src, setSrc] = useState<string>("");

    useEffect(() => {
        QRCode.toDataURL(value, { width: 280 }).then(setSrc);
    }, [value]);

    return (
        <div className="card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="section-title">{label || "QR"}</div>
                <CopyButton value={value} />
            </div>
            {src ? <img src={src} alt="QR" className="mx-auto w-48" /> : <div className="skeleton h-48" />}
            <div className="text-xs text-[hsl(var(--muted-foreground))] break-all">{value}</div>
        </div>
    );
}
