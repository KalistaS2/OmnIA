import { Injectable, signal, NgZone, OnDestroy } from '@angular/core';

const MOBILE_BREAKPOINT = 768;

@Injectable({
  providedIn: 'root',
})
export class IsMobileService implements OnDestroy {
  private isMobileSignal = signal<boolean>(false);
  
  // Sinal somente-leitura exposto para os componentes
  public isMobile = this.isMobileSignal.asReadonly();

  private mediaQueryList?: MediaQueryList;
  private listener?: () => void;

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      this.isMobileSignal.set(this.mediaQueryList.matches);

      this.listener = () => {
        this.ngZone.run(() => {
          this.isMobileSignal.set(window.innerWidth < MOBILE_BREAKPOINT);
        });
      };

      this.mediaQueryList.addEventListener('change', this.listener);
    }
  }

  ngOnDestroy(): void {
    if (this.mediaQueryList && this.listener) {
      this.mediaQueryList.removeEventListener('change', this.listener);
    }
  }
}