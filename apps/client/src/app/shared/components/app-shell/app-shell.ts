import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '@src/app/shared/components/navbar/navbar';
import { Toast } from '@src/app/shared/components/toast/toast';

@Component({
  selector: 'app-shell',
  imports: [Navbar, Toast, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar />
    <app-toast />
    <main class="dark:bg-gray-900 mx-auto max-w-5xl px-4 py-6">
      <router-outlet />
    </main>
  `,
})
export class AppShell {}
