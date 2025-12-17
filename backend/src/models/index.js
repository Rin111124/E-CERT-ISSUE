import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";

class User extends Model {}
class Template extends Model {}
class Certificate extends Model {}
class ClaimToken extends Model {}
class AuditLog extends Model {}
class Batch extends Model {}
class BatchItem extends Model {}

export function initModels() {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      fullName: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM("ISSUER_ADMIN", "STUDENT", "SYS_ADMIN"), allowNull: false },
      ethAddress: { type: DataTypes.STRING, unique: true },
      forcePasswordReset: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: "user", underscored: true, timestamps: true }
  );

  Template.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      schema: { type: DataTypes.JSONB, allowNull: false },
      issuerId: { type: DataTypes.UUID, allowNull: false },
    },
    { sequelize, modelName: "template", underscored: true, timestamps: true }
  );

  Certificate.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      certificateId: { type: DataTypes.STRING, allowNull: false, unique: true },
      canonicalJson: { type: DataTypes.JSONB, allowNull: false },
      docHash: { type: DataTypes.STRING, allowNull: false },
      signature: { type: DataTypes.STRING, allowNull: false },
      onChainTx: { type: DataTypes.STRING },
      revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: { type: DataTypes.STRING, defaultValue: "DRAFT" },
      issuedAt: { type: DataTypes.DATE },
      blockNumber: { type: DataTypes.BIGINT },
      issuerId: { type: DataTypes.UUID, allowNull: false },
      studentId: { type: DataTypes.UUID, allowNull: true },
      templateId: { type: DataTypes.UUID, allowNull: true },
      merkleRoot: { type: DataTypes.STRING },
      merkleProof: { type: DataTypes.JSONB }, // array of hex
      batchId: { type: DataTypes.UUID },
    },
    { sequelize, modelName: "certificate", underscored: true, timestamps: true }
  );

  ClaimToken.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      token: { type: DataTypes.STRING, unique: true, allowNull: false },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      claimed: { type: DataTypes.BOOLEAN, defaultValue: false },
      certificateId: { type: DataTypes.UUID, allowNull: false },
    },
    { sequelize, modelName: "claim_token", underscored: true, timestamps: true }
  );

  AuditLog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      action: { type: DataTypes.STRING, allowNull: false },
      actorId: { type: DataTypes.UUID },
      metadata: { type: DataTypes.JSONB },
    },
    { sequelize, modelName: "audit_log", underscored: true, timestamps: true }
  );

  Batch.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      merkleRoot: { type: DataTypes.STRING, unique: true, allowNull: false },
      txHash: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "PENDING" },
      anchoredAt: { type: DataTypes.DATE },
      blockNumber: { type: DataTypes.BIGINT },
      issuerId: { type: DataTypes.UUID, allowNull: false },
    },
    { sequelize, modelName: "batch", underscored: true, timestamps: true }
  );

  BatchItem.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      status: { type: DataTypes.STRING, defaultValue: "HASHED" },
      certificateId: { type: DataTypes.UUID, allowNull: false },
      batchId: { type: DataTypes.UUID, allowNull: false },
    },
    { sequelize, modelName: "batch_item", underscored: true, timestamps: true }
  );

  // Associations
  User.hasMany(Template, { foreignKey: "issuerId", as: "templates" });
  Template.belongsTo(User, { foreignKey: "issuerId", as: "issuer" });

  User.hasMany(Certificate, { foreignKey: "issuerId", as: "certificatesIssued" });
  Certificate.belongsTo(User, { foreignKey: "issuerId", as: "issuer" });

  User.hasMany(Certificate, { foreignKey: "studentId", as: "certificatesOwned" });
  Certificate.belongsTo(User, { foreignKey: "studentId", as: "student" });

  Template.hasMany(Certificate, { foreignKey: "templateId", as: "certificates" });
  Certificate.belongsTo(Template, { foreignKey: "templateId", as: "template" });

  Certificate.hasMany(ClaimToken, { foreignKey: "certificateId", as: "claimTokens" });
  ClaimToken.belongsTo(Certificate, { foreignKey: "certificateId", as: "certificate" });

  Batch.belongsTo(User, { foreignKey: "issuerId", as: "issuer" });
  User.hasMany(Batch, { foreignKey: "issuerId", as: "batches" });
  Batch.hasMany(BatchItem, { foreignKey: "batchId", as: "items" });
  BatchItem.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });
  BatchItem.belongsTo(Certificate, { foreignKey: "certificateId", as: "certificate" });
  Certificate.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });

  return { User, Template, Certificate, ClaimToken, AuditLog, Batch, BatchItem };
}

export { User, Template, Certificate, ClaimToken, AuditLog, Batch, BatchItem };
