export abstract class BaseDatabaseService {
  protected static readonly MONGO_DUPLICATE_KEY_ERROR_CODE = 11000;

  protected isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: number }).code === BaseDatabaseService.MONGO_DUPLICATE_KEY_ERROR_CODE
    );
  }
}
