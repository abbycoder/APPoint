import { useCallback, useRef, useState } from "react";

export interface ToastData {
  id: number;
  message: string;
  variant: "success" | "error";
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastData["variant"] = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      idRef.current += 1;
      setToast({ id: idRef.current, message, variant });
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  return { toast, showToast };
}
