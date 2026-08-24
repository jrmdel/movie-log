export interface IImdbSuggestionImage {
  height: number;
  imageUrl: string;
  width: number;
}

export interface IImdbSuggestionResult {
  /** Poster/thumbnail image. */
  i?: IImdbSuggestionImage;
  /** IMDb id, e.g. "tt0944947". */
  id: string;
  /** Title. */
  l: string;
  /** Human-readable category, e.g. "feature", "TV series". */
  q?: string;
  /** Category id, e.g. "movie", "tvSeries". */
  qid?: string;
  /** IMDb's relevance ranking for this suggestion, lower is more relevant. */
  rank?: number;
  /** Comma-separated headline cast. */
  s?: string;
  /** Display label for the year(s), e.g. "2011-2019 TV Series". */
  tl?: string;
  /** Release year, or start year for series. */
  y?: number;
  /** Year range for series, e.g. "2011-2019". */
  yr?: string;
}

export interface IImdbSuggestionResponse {
  /** Matching results. */
  d?: IImdbSuggestionResult[];
  /** Echo of the searched query. */
  q: string;
  /** Response format version. */
  v: number;
}
