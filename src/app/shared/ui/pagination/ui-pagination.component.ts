import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex sm:flex-row items-center w-full justify-between gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
      <!-- Rows Per Page Selector -->
      <div class="flex items-center gap-2">
        <!-- <span class="text-sm text-gray-600 dark:text-gray-300">Rows per page:</span> -->
        <select
          [value]="rowsPerPage()"
          (change)="onRowsPerPageChange($event)"
          class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
          @for (option of rowsPerPageOptions; track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>
      </div>

      <!-- Page Info -->
      <!-- <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ firstItem() }} - {{ lastItem() }} of {{ totalRecords }}
      </div> -->

      <!-- Pagination Controls -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="goToFirstPage()"
          [disabled]="isFirstPage()"
          [class.opacity-50]="isFirstPage()"
          [class.cursor-not-allowed]="isFirstPage()"
          class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          aria-label="First page">
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          type="button"
          (click)="goToPreviousPage()"
          [disabled]="isFirstPage()"
          [class.opacity-50]="isFirstPage()"
          [class.cursor-not-allowed]="isFirstPage()"
          class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          aria-label="Previous page">
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
          @for (pageNum of visiblePages(); track pageNum) {
            <button
              type="button"
              (click)="goToPage(pageNum)"
              [class.bg-primary-500]="pageNum === currentPage()"
              [class.text-white]="pageNum === currentPage()"
              [class.text-gray-700]="pageNum !== currentPage()"
              [class.dark:text-gray-300]="pageNum !== currentPage()"
              class="min-w-[2.5rem] px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {{ pageNum }}
            </button>
          }
        </div>

        <button
          type="button"
          (click)="goToNextPage()"
          [disabled]="isLastPage()"
          [class.opacity-50]="isLastPage()"
          [class.cursor-not-allowed]="isLastPage()"
          class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          aria-label="Next page">
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        <button
          type="button"
          (click)="goToLastPage()"
          [disabled]="isLastPage()"
          [class.opacity-50]="isLastPage()"
          [class.cursor-not-allowed]="isLastPage()"
          class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          aria-label="Last page">
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class UiPaginationComponent {
  @Input() first: number = 0;
  @Input() rows: number = 12;
  @Input() totalRecords: number = 0;
  @Input() rowsPerPageOptions: number[] = [12, 24, 48, 96];
  @Output() pageChange = new EventEmitter<PaginationEvent>();

  rowsPerPage = computed(() => this.rows);
  currentPage = computed(() => Math.floor(this.first / this.rows) + 1);
  totalPages = computed(() => Math.ceil(this.totalRecords / this.rows));
  firstItem = computed(() => this.first + 1);
  lastItem = computed(() => Math.min(this.first + this.rows, this.totalRecords));

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(total);
      }
    }

    return pages;
  });

  isFirstPage = computed(() => this.currentPage() === 1);
  isLastPage = computed(() => this.currentPage() >= this.totalPages());


  onRowsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newRows = parseInt(target.value, 10);
    this.emitPageChange(0, newRows);
  }

  goToFirstPage(): void {
    if (this.isFirstPage()) return;
    this.emitPageChange(0, this.rows);
  }

  goToPreviousPage(): void {
    if (this.isFirstPage()) return;
    const currentPage = this.currentPage();
    const previousPage = currentPage - 1;
    const newFirst = (previousPage - 1) * this.rows;
    this.emitPageChange(newFirst, this.rows);
  }

  goToNextPage(): void {
    if (this.isLastPage()) return;
    const currentPage = this.currentPage();
    const nextPage = currentPage + 1;
    const newFirst = (nextPage - 1) * this.rows;
    this.emitPageChange(newFirst, this.rows);
  }

  goToLastPage(): void {
    if (this.isLastPage()) return;
    const totalPages = this.totalPages();
    const newFirst = (totalPages - 1) * this.rows;
    this.emitPageChange(newFirst, this.rows);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === -1) return;
    const newFirst = (page - 1) * this.rows;
    this.emitPageChange(newFirst, this.rows);
  }

  private emitPageChange(first: number, rows: number): void {
    const page = Math.floor(first / rows) + 1;
    const pageCount = Math.ceil(this.totalRecords / rows);
    this.pageChange.emit({ first, rows, page, pageCount });
  }
}

