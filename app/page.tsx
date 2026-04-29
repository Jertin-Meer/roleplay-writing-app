export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Roleplay Writing Room
        </h1>
        <p className="text-lg text-gray-500">多人回合制语 C 写作工具</p>
        <button
          disabled
          className="mt-4 px-6 py-2 rounded-md bg-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed"
        >
          Coming soon
        </button>
      </div>
    </main>
  );
}
