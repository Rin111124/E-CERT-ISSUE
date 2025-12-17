import dotenv from "dotenv";
// Force .env values to override any existing environment vars to avoid stale RPC/keys from the shell
dotenv.config({ override: true });

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  chainId: BigInt(process.env.CHAIN_ID || "11155111"),
  registryContract: process.env.REGISTRY_CONTRACT || "",
  ethRpcUrl: process.env.ETH_RPC_URL || "",
  databaseUrl: process.env.DATABASE_URL || "",
};
