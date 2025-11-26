import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

type InputSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: 'input[uiInput], textarea[uiInput], select[uiInput]',
  standalone: true,
})
export class UiInputDirective implements OnInit, OnChanges {
  @Input('uiInput') size: InputSize | '' = 'md';
  @Input() invalid = false;

  private readonly baseClasses = [
    'w-full',
    'rounded-xl',
    'border',
    'bg-white',
    'px-4',
    'py-2.5',
    'text-sm',
    'text-gray-900',
    'placeholder:text-gray-500',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-violet-500',
    'focus-visible:border-transparent',
    'transition',
    'duration-200',
    'dark:bg-gray-900',
    'dark:text-white',
    'dark:border-gray-700',
    'dark:placeholder:text-gray-400',
  ];

  private readonly invalidClasses = ['border-red-500', 'focus-visible:ring-red-500', 'dark:border-red-400'];
  private readonly sizeMap: Record<InputSize, string[]> = {
    sm: ['text-sm', 'py-2'],
    md: ['text-base', 'py-2.5'],
    lg: ['text-base', 'py-3'],
  };

  constructor(private readonly elementRef: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}

  ngOnInit(): void {
    this.applyClasses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size'] || changes['invalid']) {
      this.applyClasses();
    }
  }

  private applyClasses(): void {
    const el = this.elementRef.nativeElement;
    const actualSize: InputSize = this.size || 'md';

    // Remove size specific classes before re-adding
    Object.values(this.sizeMap)
      .flat()
      .forEach(cls => this.renderer.removeClass(el, cls));
    this.invalidClasses.forEach(cls => this.renderer.removeClass(el, cls));
    this.renderer.removeClass(el, 'border-gray-300');
    this.renderer.removeClass(el, 'dark:border-gray-700');

    this.baseClasses.forEach(cls => this.renderer.addClass(el, cls));
    this.sizeMap[actualSize].forEach(cls => this.renderer.addClass(el, cls));

    if (this.invalid) {
      this.invalidClasses.forEach(cls => this.renderer.addClass(el, cls));
    } else {
      this.renderer.addClass(el, 'border-gray-300');
      this.renderer.addClass(el, 'dark:border-gray-700');
    }
  }
}

