import { ToastData } from "../store/useToast";

interface ToastProps {
  toast: ToastData | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-paper shadow-card animate-riseIn ${
        toast.variant === "error" ? "bg-red-600" : "bg-navy"
      }`}
    >
      {toast.variant === "success" ? (
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 10.5l4 4 8-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 6v5m0 3h.01M4 10a6 6 0 1112 0 6 6 0 01-12 0z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{toast.message}</span>
    </div>
  );
}
