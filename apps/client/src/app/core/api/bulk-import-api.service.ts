import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';

import {
  EBulkImportJobStatus,
  IBulkImportJob,
  IBulkImportRowInput,
  IResolveBulkImportRow,
} from '@src/app/core/models/bulk-import.model';
import { environment } from '@src/environments/environment';

const BULK_IMPORT_BASE_URL = `${environment.apiUrl}/bulk-imports`;
const POLL_INTERVAL_MS = 3000;

@Injectable({ providedIn: 'root' })
export class BulkImportApiService {
  private readonly http = inject(HttpClient);
  private pollSubscription: Subscription | null = null;

  readonly activeJob = signal<IBulkImportJob | null>(null);

  create(rows: IBulkImportRowInput[]): Observable<IBulkImportJob> {
    return this.http
      .post<IBulkImportJob>(BULK_IMPORT_BASE_URL, { rows })
      .pipe(tap((job) => this.trackJob(job)));
  }

  getActiveJobs(): Observable<IBulkImportJob[]> {
    return this.http.get<IBulkImportJob[]>(BULK_IMPORT_BASE_URL);
  }

  getById(id: string): Observable<IBulkImportJob> {
    return this.http.get<IBulkImportJob>(`${BULK_IMPORT_BASE_URL}/${id}`);
  }

  resolveRow(jobId: string, rowId: string, dto: IResolveBulkImportRow): Observable<IBulkImportJob> {
    return this.http
      .patch<IBulkImportJob>(`${BULK_IMPORT_BASE_URL}/${jobId}/rows/${rowId}`, dto)
      .pipe(tap((job) => this.trackJob(job)));
  }

  // Called on history page load so a job in progress (or awaiting review) survives a reload.
  refreshActiveJob(): void {
    this.getActiveJobs().subscribe((jobs) => {
      const job = jobs[0] ?? null;
      if (job) {
        this.trackJob(job);
      } else {
        this.clearActiveJob();
      }
    });
  }

  private startPolling(jobId: string): void {
    this.stopPolling();
    this.pollSubscription = timer(0, POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => this.getById(jobId)),
        tap((job) => this.activeJob.set(job)),
        takeWhile((job) => job.status === EBulkImportJobStatus.PROCESSING),
      )
      .subscribe();
  }

  private stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;
  }

  clearActiveJob(): void {
    this.stopPolling();
    this.activeJob.set(null);
  }

  private trackJob(job: IBulkImportJob): void {
    this.activeJob.set(job);
    if (job.status === EBulkImportJobStatus.PROCESSING) {
      this.startPolling(job._id);
    } else {
      this.stopPolling();
    }
  }
}
