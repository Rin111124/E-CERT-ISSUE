import { useEffect, useState } from "react";
import { AppLayout } from "../../layouts/AppLayout.tsx";
import api from "../../api/client";
import { CopyButton } from "../../components/CopyButton";

type Template = { id: string; name: string; schema: any };

export default function IssuerTemplatesPage() {
    const [items, setItems] = useState<Template[]>([]);
    const [name, setName] = useState("");
    const [schema, setSchema] = useState("{\n  \"degreeType\": \"Bachelor\",\n  \"schemaVersion\": \"1.0\"\n}");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get("/issuer/templates");
            setItems(data);
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || "Không tải được template");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setSchema("{\n  \"degreeType\": \"Bachelor\",\n  \"schemaVersion\": \"1.0\"\n}");
    };

    const onSave = async () => {
        setError(null);
        try {
            const parsed = JSON.parse(schema);
            if (editingId) {
                await api.put(`/issuer/templates/${editingId}`, { name, schema: parsed });
            } else {
                await api.post("/issuer/templates", { name, schema: parsed });
            }
            resetForm();
            load();
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                setError("Schema không phải JSON hợp lệ");
            } else {
                setError(e.response?.data?.message || e.message || "Lưu template thất bại");
            }
        }
    };

    const onEdit = (t: Template) => {
        setEditingId(t.id);
        setName(t.name);
        setSchema(JSON.stringify(t.schema, null, 2));
    };

    const onDelete = async (id: string) => {
        if (!confirm("Xóa template này?")) return;
        try {
            await api.delete(`/issuer/templates/${id}`);
            load();
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || "Xóa thất bại");
        }
    };

    return (
        <AppLayout title="Templates" user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
            <div className="grid gap-4">
                {error && <div className="callout danger">{error}</div>}

                <div className="panel stack">
                    <div className="section-title">{editingId ? "Sửa template" : "Template mới"}</div>
                    <input
                        className="input"
                        placeholder="Tên template"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <textarea
                        className="input font-mono text-xs"
                        rows={10}
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <button className="btn btn-primary" onClick={onSave} disabled={!name.trim()}>
                            {editingId ? "Cập nhật" : "Lưu template"}
                        </button>
                        {editingId && (
                            <button className="btn btn-ghost" onClick={resetForm}>
                                Hủy
                            </button>
                        )}
                    </div>
                </div>

                <div className="panel stack">
                    <div className="section-title">Danh sách template</div>
                    {loading && <div className="muted text-sm">Đang tải...</div>}
                    <div className="grid gap-3">
                        {items.map((t) => (
                            <div
                                key={t.id}
                                className="rounded-lg border border-white/10 bg-slate-900 p-4 flex flex-col gap-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-white">{t.name}</div>
                                        <div className="text-xs text-slate-400">ID: {t.id}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost text-xs" onClick={() => onEdit(t)}>
                                            Sửa
                                        </button>
                                        <button className="btn btn-ghost text-xs" onClick={() => onDelete(t.id)}>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                                <pre className="code-block text-xs max-h-40 overflow-auto">
                                    {JSON.stringify(t.schema, null, 2)}
                                </pre>
                                <div className="text-xs flex items-center gap-2">
                                    <span className="text-slate-400">TemplateId:</span>
                                    <span className="font-mono break-all">{t.id}</span>
                                    <CopyButton value={t.id} />
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && !loading && <div className="muted text-sm">Chưa có template.</div>}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
