import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { HDNodeWallet } from 'ethers/wallet';
import CryptoJS from 'crypto-js';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
export const provider = new ethers.JsonRpcProvider(RPC_URL);

let mnemonic: string | null = null;

// Check if an encrypted mnemonic exists in storage
export function isWalletInitialized(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('encrypted_mnemonic');
}

// Create a new wallet, encrypt with password, and store
export function createWallet(password: string): string {
    const newMnemonic = bip39.generateMnemonic();
    const encrypted = CryptoJS.AES.encrypt(newMnemonic, password).toString();
    localStorage.setItem('encrypted_mnemonic', encrypted);
    mnemonic = newMnemonic;
    return newMnemonic;
}

// Unlock existing wallet with password
export function unlockWallet(password: string): string | null {
    const encrypted = localStorage.getItem('encrypted_mnemonic');
    if (!encrypted) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted || !bip39.validateMnemonic(decrypted)) {
            return null;
        }
        mnemonic = decrypted;
        return decrypted;
    } catch (e) {
        return null;
    }
}

// Helper to get mnemonic (only works if unlocked)
export function getMnemonic(): string | null {
    return mnemonic;
}

export function deriveAccount(index: number): {
    address: string;
    privateKey: string;
} {
    const seed = bip39.mnemonicToSeedSync(getMnemonic()!);
    const hdNode = HDNodeWallet.fromSeed(seed);
    const path = `m/44'/60'/0'/0/${index}`; // Ethereum standard path
    const account = hdNode.derivePath(path);

    return {
        address: account.address,
        privateKey: account.privateKey,
    };
}

export async function getBalance(address: string): Promise<string> {
    try {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (err) {
        console.error(err);
        return 'Error';
    }
}

// Clear wallet (for testing / logout)
export function resetWallet() {
    localStorage.removeItem('encrypted_mnemonic');
    localStorage.removeItem('mnemonic');
    mnemonic = null;
}

export async function sendTransaction(
    privateKey: string,
    toAddress: string,
    amountInEther: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(amountInEther)
        });
        return { success: true, hash: tx.hash };
    } catch (error: any) {
        console.error("Transaction failed:", error);
        return { success: false, error: error.message };
    }
}