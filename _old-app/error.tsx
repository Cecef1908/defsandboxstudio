'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <h2 className="text-xl font-bold mb-4">Une erreur est survenue !</h2>
      <button
        onClick={() => reset()}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Réessayer
      </button>
    </div>
  );
}
