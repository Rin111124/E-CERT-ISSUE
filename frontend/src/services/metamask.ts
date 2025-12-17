import { useState, useEffect } from "react";

export interface MetaMaskAccount {
    address: string;
    balance: string;
    isConnected: boolean;
}

class MetaMaskService {
    private static instance: MetaMaskService;

    private constructor() { }

    static getInstance(): MetaMaskService {
        if (!MetaMaskService.instance) {
            MetaMaskService.instance = new MetaMaskService();
        }
        return MetaMaskService.instance;
    }

    /**
     * Kiểm tra xem MetaMask có được cài đặt không
     */
    isMetaMaskInstalled(): boolean {
        return typeof window !== "undefined" && window.ethereum !== undefined;
    }

    /**
     * Kết nối ví MetaMask
     */
    async connectWallet(): Promise<string[]> {
        if (!this.isMetaMaskInstalled()) {
            throw new Error(
                "MetaMask không được cài đặt. Vui lòng cài đặt tại https://metamask.io"
            );
        }

        try {
            const accounts = await window.ethereum!.request({
                method: "eth_requestAccounts",
            });
            return accounts;
        } catch (error: any) {
            if (error.code === 4001) {
                throw new Error("Người dùng từ chối kết nối MetaMask");
            }
            throw error;
        }
    }

    /**
     * Lấy tài khoản hiện tại
     */
    async getAccounts(): Promise<string[]> {
        try {
            const accounts = await window.ethereum!.request({
                method: "eth_accounts",
            });
            return accounts;
        } catch (error) {
            return [];
        }
    }

    /**
     * Lấy số dư ether
     */
    async getBalance(address: string): Promise<string> {
        try {
            const balance = await window.ethereum!.request({
                method: "eth_getBalance",
                params: [address, "latest"],
            });
            // Chuyển từ wei sang ETH
            const ethBalance = parseInt(balance as string, 16) / 1e18;
            return ethBalance.toFixed(4);
        } catch (error) {
            return "0";
        }
    }

    /**
     * Chuyển đổi sang Sepolia network
     */
    async switchToSepolia(): Promise<void> {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("MetaMask không được cài đặt");
        }

        try {
            // Thử chuyển sang mạng Sepolia (chain ID: 11155111)
            await window.ethereum!.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
            });
        } catch (error: any) {
            // Nếu mạng chưa được thêm, thêm nó
            if (error.code === 4902) {
                try {
                    await window.ethereum!.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0xaa36a7",
                                chainName: "Sepolia Testnet",
                                rpcUrls: [import.meta.env.VITE_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/5aa22cd0089b44e79bfa6edf21642862"],
                                nativeCurrency: {
                                    name: "Sepolia Ether",
                                    symbol: "SepoliaETH",
                                    decimals: 18,
                                },
                                blockExplorerUrls: ["https://sepolia.etherscan.io"],
                            },
                        ],
                    });
                } catch (addError) {
                    throw new Error("Không thể thêm mạng Sepolia");
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Lấy chain ID hiện tại
     */
    async getChainId(): Promise<string> {
        try {
            const chainId = await window.ethereum!.request({
                method: "eth_chainId",
            });
            return chainId;
        } catch (error) {
            return "0x0";
        }
    }

    /**
     * Ký tin nhắn (EIP-191)
     */
    async signMessage(message: string, address: string): Promise<string> {
        try {
            const signature = await window.ethereum!.request({
                method: "personal_sign",
                params: [message, address],
            });
            return signature;
        } catch (error) {
            throw new Error("Lỗi khi ký tin nhắn");
        }
    }

    /**
     * Gửi transaction (gọi smart contract)
     */
    async sendTransaction(
        to: string,
        from: string,
        data: string,
        value?: string
    ): Promise<string> {
        try {
            const txHash = await window.ethereum!.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from,
                        to,
                        data,
                        value: value || "0x0",
                    },
                ],
            });
            return txHash;
        } catch (error) {
            throw new Error("Lỗi khi gửi transaction");
        }
    }

    /**
     * Lắng nghe thay đổi tài khoản
     */
    onAccountsChanged(callback: (accounts: string[]) => void): void {
        if (this.isMetaMaskInstalled()) {
            window.ethereum!.on("accountsChanged", callback);
        }
    }

    /**
     * Lắng nghe thay đổi chain/network
     */
    onChainChanged(callback: (chainId: string) => void): void {
        if (this.isMetaMaskInstalled()) {
            window.ethereum!.on("chainChanged", callback);
        }
    }

    /**
     * Hủy listener
     */
    removeListener(event: string, callback: any): void {
        if (this.isMetaMaskInstalled()) {
            window.ethereum!.removeListener(event, callback);
        }
    }
}

export const metamaskService = MetaMaskService.getInstance();

/**
 * React Hook để sử dụng MetaMask
 */
export function useMetaMask() {
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string>("0");
    const [chainId, setChainId] = useState<string>("0x0");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Kiểm tra kết nối khi component mount
    useEffect(() => {
        checkConnection();

        // Lắng nghe sự thay đổi tài khoản
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                loadBalance(accounts[0]);
            } else {
                setAccount(null);
                setIsConnected(false);
            }
        };

        // Lắng nghe sự thay đổi network
        const handleChainChanged = (newChainId: string) => {
            setChainId(newChainId);
        };

        metamaskService.onAccountsChanged(handleAccountsChanged);
        metamaskService.onChainChanged(handleChainChanged);

        return () => {
            metamaskService.removeListener("accountsChanged", handleAccountsChanged);
            metamaskService.removeListener("chainChanged", handleChainChanged);
        };
    }, []);

    const checkConnection = async () => {
        if (!metamaskService.isMetaMaskInstalled()) {
            setError("MetaMask chưa được cài đặt");
            return;
        }

        const accounts = await metamaskService.getAccounts();
        const chainId = await metamaskService.getChainId();

        setChainId(chainId);
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            loadBalance(accounts[0]);
        }
    };

    const loadBalance = async (address: string) => {
        const bal = await metamaskService.getBalance(address);
        setBalance(bal);
    };

    const connect = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const accounts = await metamaskService.connectWallet();
            setAccount(accounts[0]);
            setIsConnected(true);
            loadBalance(accounts[0]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const switchNetwork = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await metamaskService.switchToSepolia();
            const newChainId = await metamaskService.getChainId();
            setChainId(newChainId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isSepolia = chainId === "0xaa36a7"; // 11155111 in hex

    return {
        account,
        balance,
        chainId,
        isConnected,
        isSepolia,
        isLoading,
        error,
        connect,
        switchNetwork,
        signMessage: metamaskService.signMessage,
        sendTransaction: metamaskService.sendTransaction,
    };
}

// Type extension cho window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}
