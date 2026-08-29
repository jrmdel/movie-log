import { Routes } from '@angular/router';

import { authGuard } from '@src/app/core/auth/auth.guard';
import { EListType } from '@src/app/core/models/list.model';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@src/app/features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('@src/app/features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@src/app/shared/components/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        loadComponent: () => import('@src/app/features/home/home').then((m) => m.Home),
      },
      {
        path: 'movies/:id',
        loadComponent: () =>
          import('@src/app/features/movie-detail/movie-detail').then((m) => m.MovieDetail),
      },
      {
        path: 'watchlist',
        data: { listType: EListType.WATCHLIST },
        loadComponent: () =>
          import('@src/app/features/lists/saved-list/saved-list').then((m) => m.SavedList),
      },
      {
        path: 'favorites',
        data: { listType: EListType.FAVORITES },
        loadComponent: () =>
          import('@src/app/features/lists/saved-list/saved-list').then((m) => m.SavedList),
      },
      {
        path: 'lists',
        loadComponent: () =>
          import('@src/app/features/lists/custom-lists/custom-lists').then((m) => m.CustomLists),
      },
      {
        path: 'lists/:id',
        loadComponent: () =>
          import('@src/app/features/lists/list-detail/list-detail').then((m) => m.ListDetail),
      },
      {
        path: 'history',
        loadComponent: () => import('@src/app/features/history/history').then((m) => m.History),
      },
      {
        path: 'profile',
        loadComponent: () => import('@src/app/features/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
