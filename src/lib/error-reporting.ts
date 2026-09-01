export function reportClientError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  console.error("[ClientError]", {
    error,
    route: window.location.pathname,
    ...context,
  });
}
