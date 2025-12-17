// Backend Logging Service
const { DataTypes } = require("sequelize");

// Define Log model
function initLogModel(sequelize) {
    const Log = sequelize.define(
        "Log",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            timestamp: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                index: true,
            },
            level: {
                type: DataTypes.ENUM("INFO", "SUCCESS", "WARNING", "ERROR"),
                defaultValue: "INFO",
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
                index: true,
            },
            actor: {
                type: DataTypes.STRING,
                allowNull: false,
                index: true,
            },
            message: {
                type: DataTypes.TEXT,
            },
            metadata: {
                type: DataTypes.JSON,
            },
        },
        {
            tableName: "logs",
            timestamps: false,
        }
    );

    return Log;
}

// Logger utility class
class LoggerService {
    constructor(Log) {
        this.Log = Log;
    }

    async log(level, action, message, actor = "SYSTEM", metadata = {}) {
        try {
            await this.Log.create({
                level,
                action,
                message,
                actor,
                metadata,
            });
        } catch (err) {
            console.error("Failed to persist log:", err);
        }
    }

    async info(action, message, actor = "SYSTEM", metadata = {}) {
        return this.log("INFO", action, message, actor, metadata);
    }

    async success(action, message, actor = "SYSTEM", metadata = {}) {
        return this.log("SUCCESS", action, message, actor, metadata);
    }

    async warning(action, message, actor = "SYSTEM", metadata = {}) {
        return this.log("WARNING", action, message, actor, metadata);
    }

    async error(action, message, actor = "SYSTEM", metadata = {}) {
        return this.log("ERROR", action, message, actor, metadata);
    }

    async getLogs(filters = {}) {
        const where = {};
        if (filters.action) where.action = filters.action;
        if (filters.level) where.level = filters.level;
        if (filters.actor) where.actor = filters.actor;
        if (filters.startDate || filters.endDate) {
            where.timestamp = {};
            if (filters.startDate) where.timestamp.$gte = new Date(filters.startDate);
            if (filters.endDate) where.timestamp.$lte = new Date(filters.endDate);
        }

        return this.Log.findAll({
            where,
            order: [["timestamp", "DESC"]],
            limit: filters.limit || 100,
            offset: filters.offset || 0,
        });
    }
}

module.exports = {
    initLogModel,
    LoggerService,
};
