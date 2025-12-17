type Props = {
    label?: string;
    onFiles: (files: FileList) => void;
};

export function FileUploader({ label = "Upload file", onFiles }: Props) {
    return (
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-8 text-center cursor-pointer hover:border-[hsl(var(--primary))]">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
            <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && onFiles(e.target.files)}
            />
        </label>
    );
}
