import { IBulkImportRowInput } from '@src/app/core/models/bulk-import.model';

const MAX_ROWS_PER_IMPORT = 50;
const MIN_YEAR = 1888;
const MAX_YEAR = 2100;

export interface IBulkImportParseSuccess {
  valid: true;
  rows: IBulkImportRowInput[];
}

export interface IBulkImportParseFailure {
  valid: false;
  errors: string[];
}

export type BulkImportParseResult = IBulkImportParseSuccess | IBulkImportParseFailure;

export function parseBulkImportInput(raw: string): BulkImportParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valid: false, errors: ['Invalid JSON.'] };
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, errors: ['The input must be a JSON array of movies.'] };
  }
  if (parsed.length === 0) {
    return { valid: false, errors: ['Add at least one movie to import.'] };
  }
  if (parsed.length > MAX_ROWS_PER_IMPORT) {
    return {
      valid: false,
      errors: [`You can import at most ${MAX_ROWS_PER_IMPORT} movies at once.`],
    };
  }

  const errors: string[] = [];
  const rows: IBulkImportRowInput[] = [];

  parsed.forEach((item: unknown, index: number) => {
    const result = validateRow(item, index);
    if (result.errors.length > 0) {
      errors.push(...result.errors);
    } else if (result.row) {
      rows.push(result.row);
    }
  });

  return errors.length > 0 ? { valid: false, errors } : { valid: true, rows };
}

function validateRow(
  item: unknown,
  index: number,
): { row?: IBulkImportRowInput; errors: string[] } {
  const label = `Item ${index + 1}`;
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    return { errors: [`${label}: must be an object.`] };
  }

  const { imdbId, title, year, viewDate } = item as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push(`${label}: "title" is required.`);
  }
  if (imdbId !== undefined && (typeof imdbId !== 'string' || imdbId.trim().length === 0)) {
    errors.push(`${label}: "imdbId" must be a non-empty string.`);
  }
  if (
    year !== undefined &&
    (typeof year !== 'number' || !Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR)
  ) {
    errors.push(`${label}: "year" must be a valid year.`);
  }
  if (
    viewDate !== undefined &&
    (typeof viewDate !== 'string' || Number.isNaN(Date.parse(viewDate)))
  ) {
    errors.push(`${label}: "viewDate" must be a valid date string.`);
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors: [],
    row: {
      title: (title as string).trim(),
      ...(imdbId !== undefined && { imdbId: (imdbId as string).trim() }),
      ...(year !== undefined && { year: year as number }),
      ...(viewDate !== undefined && { viewDate: viewDate as string }),
    },
  };
}
