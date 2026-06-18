export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 400
  ) {
    super(message);
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "操作失败，请稍后重试。";
}
