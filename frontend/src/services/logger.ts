// Frontend Logging Service
export type LogLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type LogAction =
    | "TEMPLATE_CREATE"
    | "CERTIFICATE_DRAFT"
    | "CERTIFICATE_SIGN"
    | "CERTIFICATE_ISSUE"
    | "CERTIFICATE_REVOKE"
    | "CERTIFICATE_CLAIM"
    | "CERTIFICATE_VERIFY"
    | "USER_LOGIN"
    | "USER_LOGOUT";

export interface LogEntry {
    id?: string;
    timestamp: string;
    level: LogLevel;
    action: LogAction;
    actor: string; // user email
    message: string;
    metadata?: Record<string, any>;
}

class Logger {
    private endpoint = "/api/logs"; // Backend endpoint to persist logs

    async log(
        level: LogLevel,
        action: LogAction,
        message: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        const actor = localStorage.getItem("userEmail") || "anonymous";
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            action,
            actor,
            message,
            metadata,
        };

        // Log to console in development
        const colors = {
            INFO: "color: #0891b2",
            SUCCESS: "color: #10b981",
            WARNING: "color: #f59e0b",
            ERROR: "color: #ef4444",
        };
        console.log(
            `%c[${level}] ${action}`,
            colors[level],
            message,
            metadata || ""
        );

        // Send to backend for persistence
        try {
            await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
        } catch (err) {
            console.error("Failed to log to backend:", err);
        }
    }

    info(
        action: LogAction,
        message: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        return this.log("INFO", action, message, metadata);
    }

    success(
        action: LogAction,
        message: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        return this.log("SUCCESS", action, message, metadata);
    }

    warning(
        action: LogAction,
        message: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        return this.log("WARNING", action, message, metadata);
    }

    error(
        action: LogAction,
        message: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        return this.log("ERROR", action, message, metadata);
    }
}

export const logger = new Logger();
