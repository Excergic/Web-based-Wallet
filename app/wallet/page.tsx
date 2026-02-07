'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Copy, EyeOff, Plus, Trash2 } from 'lucide-react';
import { AccountCard } from '@/components/AccountCard';

export default function WalletPage() {
    const { initialized, isLocked, accounts, mnemonic, checkInitialized, create, unlock, addAccount, reset } = useWallet()
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkInitialized();
        const shown = localStorage.getItem('mnemonic_shown');
        if (!shown) setShowMnemonic(true);
    }, [checkInitialized]);
    const handleMnemonicWritten = () => {
        localStorage.setItem('mnemonic_shown', 'true');
        setShowMnemonic(false);
    }
    const handleCreate = async () => {
        if (!password) { setError('Password is required'); return; }
        setLoading(true);
        await create(password);
        setShowMnemonic(true);
        setLoading(false);
    };

    const handleUnlock = async () => {
        if (!password) { setError('Password is required'); return; }
        setLoading(true);
        const success = await unlock(password);
        if (!success) setError('Incorrect password');
        setLoading(false);
    };

    if (!initialized) {
        // Create Wallet Screen
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 border dark:border-gray-800 p-8 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Create Wallet</h1>
                    <p className="text-gray-500 mb-6">Set a password to encrypt your new wallet.</p>

                    <input
                        type="password"
                        placeholder="Enter a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 mb-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-blue-500"
                    />

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create New Wallet'}
                    </button>
                </div>
            </div>
        );
    }

    if (isLocked) {
        // Unlock Wallet Screen
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 border dark:border-gray-800 p-8 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Unlock Wallet</h1>
                    <p className="text-gray-500 mb-6">Enter your password to access your accounts.</p>

                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-4 py-3 mb-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-blue-500"
                    />

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button
                        onClick={handleUnlock}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {loading ? 'Unlocking...' : 'Unlock Wallet'}
                    </button>

                    <div className="mt-6 text-center">
                        <button onClick={() => { if (confirm('This will wipe your existing wallet. Are you sure?')) reset(); }} className="text-red-500 text-sm hover:underline">Reset / Wipe Wallet</button>
                    </div>
                </div>
            </div>
        );
    }

    const words = mnemonic ? mnemonic.split(' ') : [];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Ethereum Wallet Manager</h1>
                <div className="flex gap-2">
                    <button
                        onClick={addAccount}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} /> Add Wallet
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete ALL wallets?')) reset();
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                        title="Delete All Wallets"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Show mnemonic once - very important warning! */}
            {showMnemonic && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                            <EyeOff size={24} className="text-yellow-700 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">Secret Recovery Phrase</h2>
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">Save these words in a safe place. do NOT share them with anyone.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {words.map((word, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-yellow-100 dark:border-gray-700 shadow-sm relative">
                                <span className="absolute top-1 left-2 text-xs text-gray-400 font-mono select-none">{index + 1}</span>
                                <p className="text-center font-bold text-gray-700 dark:text-gray-200 mt-2">{word}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center bg-yellow-100 dark:bg-yellow-900/40 p-4 rounded-lg cursor-pointer" onClick={() => navigator.clipboard.writeText(mnemonic || "")}>
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-medium">
                            <Copy size={18} />
                            <span>Click here to copy to clipboard</span>
                        </div>
                    </div>

                    <button
                        onClick={handleMnemonicWritten}
                        className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
                    >
                        I have saved my recovery phrase
                    </button>
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Your Accounts</h2>
                <div className="grid gap-6">
                    {accounts.map((acc) => (
                        <AccountCard key={acc.index} account={acc} />
                    ))}
                </div>
            </div>
        </div>
    );
}
