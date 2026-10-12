import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The requested disaster telemetry endpoint or view does not exist.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
