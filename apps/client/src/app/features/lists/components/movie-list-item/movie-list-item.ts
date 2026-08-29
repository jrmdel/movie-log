import { Component, input, output } from '@angular/core';
import { IMovieDocument } from '@src/app/core/models/movie.model';
import { MovieCard } from '@src/app/shared/components/movie-card/movie-card';

@Component({
  selector: 'app-movie-list-item',
  imports: [MovieCard],
  template: `
    <div class="flex flex-col gap-2">
      <app-movie-card
        [id]="movie().externalId"
        [title]="movie().title"
        [year]="movie().year"
        [rating]="movie().rating"
        [posterUrl]="movie().url"
      />
      <button
        type="button"
        class="rounded-md border border-red-200 bg-transparent px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
        (click)="removeMovie.emit(movie()._id)"
      >
        Remove
      </button>
    </div>
  `,
})
export class MovieListItem {
  readonly movie = input.required<IMovieDocument>();
  readonly removeMovie = output<string>();
}
