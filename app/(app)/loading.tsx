/**
 * Covers the (app) layout's own async work (session check, shell data)
 * which sits above any individual route's loading.tsx — without this,
 * Next.js has no Suspense boundary to show while the layout itself is
 * still resolving, so navigation looks frozen for however long that takes.
 */
export default function AppGroupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-salt">
      <div
        aria-label="Loading"
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-pepper border-t-oxblood"
      />
    </div>
  );
}
