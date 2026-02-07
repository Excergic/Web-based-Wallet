import { create } from "zustand";
import { isWalletInitialized, createWallet, unlockWallet, deriveAccount, getBalance, getMnemonic } from "@/lib/wallet";

export type Account = {
    index: number;
    address: string;
    privateKey: string;
    balance: string;
};

type WalletState = {
    initialized: boolean;
    isLocked: boolean;
    mnemonic: string | null;
    accounts: Account[];
    checkInitialized: () => void;
    unlock: (password: string) => Promise<boolean>;
    create: (password: string) => Promise<void>;
    addAccount: () => Promise<void>;
    loadAccounts: () => Promise<void>;
    reset: () => void;
};

export const useWallet = create<WalletState>((set, get) => ({
    initialized: false,
    isLocked: true,
    mnemonic: null,
    accounts: [],

    checkInitialized() {
        set({ initialized: isWalletInitialized() });
    },

    async unlock(password: string) {
        const mnemonic = unlockWallet(password);
        if (mnemonic) {
            set({ mnemonic, isLocked: false });
            await get().loadAccounts();
            return true;
        }
        return false;
    },

    async create(password: string) {
        const mnemonic = createWallet(password);
        set({ mnemonic, isLocked: false, initialized: true });
        await get().loadAccounts();
    },

    async loadAccounts() {
        if (get().isLocked) return;
        const mnemonic = getMnemonic();
        if (!mnemonic) return;

        let count = 1;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('wallet_account_count');
            if (stored) count = parseInt(stored, 10);
        }

        const accounts: Account[] = [];
        for (let i = 0; i < count; i++) {
            const { address, privateKey } = deriveAccount(i);
            const balance = await getBalance(address);
            accounts.push({ index: i, address, privateKey, balance });
        }

        set({ accounts, initialized: true, mnemonic });
    },

    async addAccount() {
        const index = get().accounts.length;
        const { address, privateKey } = deriveAccount(index);
        const balance = await getBalance(address);
        set((state) => ({
            accounts: [...state.accounts, { index, address, privateKey, balance }],
        }));

        if (typeof window !== 'undefined') {
            localStorage.setItem('wallet_account_count', (index + 1).toString());
        }
    },

    reset() {
        localStorage.removeItem('encrypted_mnemonic');
        localStorage.removeItem('wallet_account_count');
        localStorage.removeItem('mnemonic_shown');
        set({ accounts: [], mnemonic: null, initialized: false, isLocked: true });
    },
}));
