import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

interface CountUpOptions {
  duration?: number; // seconds
  startVal?: number;
}

/**
 * Animates an element's text content from `options.startVal` to the bound value.
 * Drop-in replacement for ngx-countup's `[countUp]` directive (the only features
 * this app used: `duration` and `startVal`).
 */
@Directive({
  selector: '[countUp]',
  standalone: true
})
export class CountUpDirective implements OnChanges, OnDestroy {
  @Input('countUp') endVal = 0;
  @Input() options: CountUpOptions = {};

  private rafId: number | null = null;
  // The value currently shown in the element. Subsequent changes animate from
  // here so a value update counts up (or down) from where it left off, not 0.
  private displayedVal: number | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['endVal']) {
      this.animate(changes['endVal'].firstChange);
    }
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  private animate(firstChange: boolean): void {
    this.cancel();
    // On the first render start from `startVal` (default 0); on later updates
    // start from the value already on screen.
    const start = firstChange || this.displayedVal === null ? this.options.startVal ?? 0 : this.displayedVal;
    const end = this.endVal ?? 0;
    const durationMs = (this.options.duration ?? 1.5) * 1000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = durationMs > 0 ? Math.min((now - startTime) / durationMs, 1) : 1;
      const eased = 1 - (1 - progress) * (1 - progress); // easeOutQuad
      const current = Math.round(start + (end - start) * eased);
      this.displayedVal = current;
      this.el.nativeElement.textContent = current.toLocaleString();
      this.rafId = progress < 1 ? requestAnimationFrame(tick) : null;
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
