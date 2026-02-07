
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Ethereum Wallet Manager</h1>
      <p className="text-xl mb-8">Let's build your multi-account Ethereum wallet!</p>

      <a
        href="/wallet"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
      >
        Go to Wallet Dashboard →
      </a>
    </main>
  );
}