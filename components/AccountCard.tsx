'use client';

import { useState } from 'react';
import { Account, useWallet } from '@/hooks/useWallet';
import { Copy, Eye, EyeOff, Send, Loader2 } from 'lucide-react';
import { sendTransaction } from '@/lib/wallet';

interface AccountCardProps {
    account: Account;
}

export const AccountCard = ({ account }: AccountCardProps) => {
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendAmount, setSendAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Check if useWallet returns valid object before destructuring
    const wallet = useWallet();
    const loadAccounts = wallet?.loadAccounts || (async () => { });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setTxStatus('loading');
        setErrorMsg('');
        setTxHash('');

        if (!recipient || !sendAmount) {
            setErrorMsg('Please fill all fields');
            setTxStatus('error');
            return;
        }

        const result = await sendTransaction(account.privateKey, recipient, sendAmount);

        if (result.success) {
            setTxStatus('success');
            setTxHash(result.hash || '');
            setSendAmount('');
            setRecipient('');
            // Refresh balances after short delay to allow propagation
            setTimeout(() => loadAccounts(), 2000);
        } else {
            setTxStatus('error');
            setErrorMsg(result.error || 'Transaction failed');
        }
    };

    return (
        <div className="border rounded-lg p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded text-gray-500 font-medium">Wallet #{account.index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="font-mono text-lg break-all">{account.address}</p>
                        <button
                            onClick={() => navigator.clipboard.writeText(account.address)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Copy Address"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 mb-6">
                <p className="text-3xl font-bold tracking-tight">{account.balance} ETH</p>
                <p className="text-sm text-gray-500 mt-1">Available Balance</p>
            </div>

            <div className="mb-6">
                <button
                    onClick={() => setIsSending(!isSending)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSending
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                >
                    <Send size={16} /> {isSending ? 'Cancel Send' : 'Send ETH'}
                </button>

                {isSending && (
                    <form onSubmit={handleSend} className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recipient Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (ETH)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    placeholder="0.00"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            {txStatus === 'error' && (
                                <p className="text-xs text-red-600 dark:text-red-400 break-all bg-red-50 dark:bg-red-900/20 p-2 rounded">{errorMsg}</p>
                            )}

                            {txStatus === 'success' && (
                                <div className="text-xs text-green-600 dark:text-green-400 break-all p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900/30">
                                    <p className="font-bold mb-1">✓ Transaction Sent!</p>
                                    <p className="font-mono text-[10px] opacity-80">Hash: {txHash}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={txStatus === 'loading'}
                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2.5 rounded-md text-sm font-medium transition-all shadow-sm active:transform active:scale-[0.98]"
                            >
                                {txStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Send'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Private Key</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center gap-1 text-xs font-medium"
                        >
                            {showPrivateKey ? (
                                <>
                                    <EyeOff size={14} /> Hide
                                </>
                            ) : (
                                <>
                                    <Eye size={14} /> Show
                                </>
                            )}
                        </button>
                        {showPrivateKey && (
                            <button
                                onClick={() => navigator.clipboard.writeText(account.privateKey)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="Copy Private Key"
                            >
                                <Copy size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <p className="font-mono text-sm break-all text-gray-600 dark:text-gray-300">
                    {showPrivateKey ? (
                        account.privateKey
                    ) : (
                        '•'.repeat(64) // Masked private key
                    )}
                </p>
            </div>
        </div>
    );
};
