import { AppLayout } from "../../layouts/AppLayout.tsx";

export default function IssuerTemplatesPage() {
    return (
        <AppLayout title="Templates" user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
            <div className="grid gap-4">
                <div className="panel">
                    <h3>Template Library</h3>
                    <p className="muted">Manage issuance templates. Builder UI will live here.</p>
                </div>
            </div>
        </AppLayout>
    );
}
