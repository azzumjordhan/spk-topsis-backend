import { PaginationMeta } from './pagination.interface';

export class CustomPagination<T> {
  items: T[];
  meta: PaginationMeta;

  constructor(
    items: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
  ) {
    this.items = items;
    this.meta = this.generateMeta(totalItems, currentPage, itemsPerPage);
  }

  private generateMeta(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const itemCount =
      currentPage >= totalPages
        ? currentPage > totalPages
          ? 0
          : totalItems % itemsPerPage
        : itemsPerPage;

    return {
      totalItems,
      itemCount,
      itemsPerPage,
      totalPages,
      currentPage,
    };
  }
}
