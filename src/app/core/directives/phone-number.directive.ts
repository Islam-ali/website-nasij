import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[phoneNumber]',
  standalone: true,
})
export class PhoneNumberDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

}
