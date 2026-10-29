export interface ApiGenericError {
  message: string;
}

export interface ApiValidationError extends ApiGenericError {
  errors: Record<string, string[]>;
}
