import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchFilters, { SearchFiltersState } from './SearchFilters';

describe('SearchFilters', () => {
  const defaultFilters: SearchFiltersState = {
    keyword: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    brand: '',
    fuelType: '',
    transmission: '',
  };

  const mockOnFiltersChange = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnClearFilters = vi.fn();
  const mockOnToggleFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render quick search input', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={false}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    expect(screen.getByPlaceholderText(/Search by brand, model or keyword/i)).toBeInTheDocument();
  });

  it('should render search and filters buttons', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={false}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument();
  });

  it('should call onSearch when search button is clicked', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={false}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleFilters when filters button is clicked', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={false}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const filtersButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filtersButton);

    expect(mockOnToggleFilters).toHaveBeenCalledTimes(1);
  });

  it('should update keyword filter on input change', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={false}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const input = screen.getByPlaceholderText(/Search by brand, model or keyword/i);
    fireEvent.change(input, { target: { value: 'Toyota' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('should not show advanced filters when showFilters is false', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={false}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    expect(screen.queryByPlaceholderText(/Ex: 500000/i)).not.toBeInTheDocument();
  });

  it('should show advanced filters when showFilters is true', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    expect(screen.getByPlaceholderText(/Ex: 500000/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: 2000000/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: 2015/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: 2024/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Toyota, Ford.../i)).toBeInTheDocument();
  });

  it('should update price filters', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const minPriceInput = screen.getByPlaceholderText(/Ex: 500000/i);
    fireEvent.change(minPriceInput, { target: { value: '10000' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('should update year filters', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const minYearInput = screen.getByPlaceholderText(/Ex: 2015/i);
    fireEvent.change(minYearInput, { target: { value: '2015' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('should update brand filter', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const brandInput = screen.getByPlaceholderText(/Ex: Toyota, Ford.../i);
    fireEvent.change(brandInput, { target: { value: 'Toyota' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('should update fuel type select', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const fuelSelect = selects[0];
    fireEvent.change(fuelSelect, { target: { value: 'GASOLINE' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('should update transmission select', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const transmissionSelect = selects[1];
    fireEvent.change(transmissionSelect, { target: { value: 'MANUAL' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('should call onClearFilters when clear button is clicked', () => {
    render(
      <SearchFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onSearch={mockOnSearch}
        onClearFilters={mockOnClearFilters}
        showFilters={true}
        onToggleFilters={mockOnToggleFilters}
      />
    );

    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
  });
});