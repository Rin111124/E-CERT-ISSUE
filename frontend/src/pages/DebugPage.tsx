export function DebugPage() {
    return (
        <div style={{ padding: "20px", color: "white", background: "#000" }}>
            <h1>Debug Page</h1>
            <p>MetaMask available: {(window as any).ethereum ? "Yes" : "No"}</p>
            <p>typeof window: {typeof window}</p>
        </div>
    );
}
