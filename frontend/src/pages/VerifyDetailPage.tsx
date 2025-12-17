import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { verifyCertificate } from "../services/api";

export function VerifyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [data, setData] = useState<any | null>(location.state || null);

    useEffect(() => {
        if (!data && id) {
            verifyCertificate(id).then(setData);
        }
    }, [data, id]);

    if (!id) return null;

    return (
        <div className="space-y-4">
            <div className="panel p-4 flex items-center gap-3">
                <h1 className="text-xl font-semibold">Verification result</h1>
                {data && <StatusBadge status={data.status} />}
            </div>

            <div className="panel p-4 space-y-3">
                <div className="section-title">Evidence</div>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div>
                        <p className="text-xs text-slate-400">Certificate ID</p>
                        <p className="font-mono text-cyan-300 break-all">{id}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">On-chain hash</p>
                        <p className="font-mono text-xs text-slate-300 break-all">{data?.onChainHash || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Computed hash</p>
                        <p className="font-mono text-xs text-slate-300 break-all">{data?.computedHash || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Issuer</p>
                        <p className="font-mono text-xs text-slate-300 break-all">{data?.issuer || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Tx hash</p>
                        <p className="font-mono text-xs text-slate-300 break-all">{data?.txHash || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Block</p>
                        <p className="font-mono text-xs text-slate-300 break-all">
                            {data?.blockNumber ? data.blockNumber.toString() : "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
