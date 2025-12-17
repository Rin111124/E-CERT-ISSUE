type Item = { label: string; value?: string | number | null; copyable?: boolean };

export function KeyValueList({ items }: { items: Item[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {items.map((item) => (
                <div key={item.label} className="flex flex-col gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2">
                    <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
                    <span className="font-semibold text-[hsl(var(--foreground))] break-all">
                        {item.value ?? "—"}
                    </span>
                </div>
            ))}
        </div>
    );
}
