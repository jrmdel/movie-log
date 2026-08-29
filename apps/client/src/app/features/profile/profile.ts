import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AccountApiService } from '@src/app/core/api/account-api.service';
import { AuthService } from '@src/app/core/auth/auth.service';
import { NotificationService } from '@src/app/core/services/notification.service';
import { ConfirmDialog } from '@src/app/shared/components/confirm-dialog/confirm-dialog';
import { ThemeSettingsComponent } from './components/theme/theme.component';

const MIN_PASSWORD_LENGTH = 8;

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmNewPassword = control.get('confirmNewPassword')?.value;
  return newPassword === confirmNewPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, ConfirmDialog, ThemeSettingsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>

    @if (loading()) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else {
      <section class="mt-6 max-w-sm">
        <h2 class="text-sm font-medium text-gray-800 dark:text-gray-200">Account details</h2>
        <form class="mt-2 flex flex-col gap-3" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">
            Username
            <input
              type="text"
              formControlName="username"
              class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </label>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">
            Email
            <input
              type="email"
              formControlName="email"
              class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </label>
          <button
            type="submit"
            [disabled]="profileForm.invalid || savingProfile()"
            class="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {{ savingProfile() ? 'Saving…' : 'Save changes' }}
          </button>
        </form>
      </section>

      <!-- Intégration du composant Thème -->
      <app-theme-settings></app-theme-settings>

      <section class="mt-8 max-w-sm">
        <h2 class="text-sm font-medium text-gray-800 dark:text-gray-200">Change password</h2>
        <form
          class="mt-2 flex flex-col gap-3"
          [formGroup]="passwordForm"
          (ngSubmit)="changePassword()"
        >
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">
            Current password
            <input
              type="password"
              formControlName="currentPassword"
              autocomplete="current-password"
              class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </label>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">
            New password
            <input
              type="password"
              formControlName="newPassword"
              autocomplete="new-password"
              class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </label>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">
            Confirm new password
            <input
              type="password"
              formControlName="confirmNewPassword"
              autocomplete="new-password"
              class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </label>
          @if (
            passwordForm.errors?.['mismatch'] && passwordForm.controls.confirmNewPassword.touched
          ) {
            <p class="text-sm text-red-600 dark:text-red-400" role="alert">
              Passwords do not match.
            </p>
          }
          <button
            type="submit"
            [disabled]="passwordForm.invalid || changingPassword()"
            class="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:enabled:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:enabled:bg-indigo-600"
          >
            {{ changingPassword() ? 'Saving…' : 'Change password' }}
          </button>
        </form>
      </section>

      <section class="mt-8 max-w-sm border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2 class="text-sm font-medium text-red-700 dark:text-red-400">Delete account</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This permanently deletes your account, lists, and watch history. This cannot be undone.
        </p>
        <button
          type="button"
          class="mt-3 rounded-md border border-red-300 bg-transparent px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          (click)="confirmDeleteOpen.set(true)"
        >
          Delete my account
        </button>
      </section>
    }

    <app-confirm-dialog
      [open]="confirmDeleteOpen()"
      title="Delete account"
      message="This will permanently delete your account and all of your data. This cannot be undone."
      confirmLabel="Delete my account"
      (confirm)="deleteAccount()"
      (cancel)="confirmDeleteOpen.set(false)"
    />`,
})
export class Profile {
  private readonly accountApi = inject(AccountApiService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly savingProfile = signal(false);
  protected readonly changingPassword = signal(false);
  protected readonly confirmDeleteOpen = signal(false);

  protected readonly profileForm = this.formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly passwordForm = this.formBuilder.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  constructor() {
    this.accountApi.getMe().subscribe({
      next: (account) => {
        this.profileForm.setValue({ username: account.username, email: account.email });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Failed to load your profile.');
      },
    });
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) {
      return;
    }

    this.savingProfile.set(true);
    this.accountApi.updateMe(this.profileForm.getRawValue()).subscribe({
      next: (account) => {
        this.savingProfile.set(false);
        this.authService.setCurrentUser(account);
        this.notificationService.success('Profile updated.');
      },
      error: (error: unknown) => {
        this.savingProfile.set(false);
        this.notificationService.error(
          error instanceof HttpErrorResponse && error.status === 409
            ? 'That email or username is already in use.'
            : 'Failed to update your profile.',
        );
      },
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid || this.changingPassword()) {
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.changingPassword.set(true);
    this.accountApi.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        this.notificationService.success('Password changed.');
      },
      error: (error: unknown) => {
        this.changingPassword.set(false);
        this.notificationService.error(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'Current password is incorrect.'
            : 'Failed to change your password.',
        );
      },
    });
  }

  protected deleteAccount(): void {
    this.accountApi.deleteMe().subscribe({
      next: () => {
        this.authService.clearSession();
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        this.confirmDeleteOpen.set(false);
        this.notificationService.error('Failed to delete your account.');
      },
    });
  }
}
