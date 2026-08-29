import { effect, signal, Signal } from '@angular/core';

export function debouncedSignal<T>(sourceSignal: Signal<T>, debounceTimeInMs = 0): Signal<T> {
  const debounceSignal = signal(sourceSignal());
  effect((onCleanup) => {
    const value = sourceSignal();
    const timeout = setTimeout(() => debounceSignal.set(value), debounceTimeInMs);

    onCleanup(() => clearTimeout(timeout));
  });
  return debounceSignal;
}

export function minDurationSignal<T>(
  sourceSignal: Signal<T>,
  minDurationInMs = 250,
  activeValue: T = true as unknown as T,
): Signal<T> {
  const outputSignal = signal<T>(sourceSignal());
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let activeStartTime = 0;

  effect((onCleanup) => {
    const value = sourceSignal();
    const now = Date.now();

    if (value === activeValue) {
      if (timeout) clearTimeout(timeout);
      activeStartTime = now;
      outputSignal.set(value);
    } else {
      const elapsed = now - activeStartTime;
      const remaining = minDurationInMs - elapsed;

      if (remaining > 0) {
        timeout = setTimeout(() => {
          outputSignal.set(value);
        }, remaining);
      } else {
        outputSignal.set(value);
      }
    }

    onCleanup(() => {
      if (timeout) clearTimeout(timeout);
    });
  });

  return outputSignal;
}
