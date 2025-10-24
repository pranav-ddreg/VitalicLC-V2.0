'use client'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { Table } from '@tanstack/react-table'

// Define the faceted filter structure
interface FacetedFilterOption {
  label: string
  value: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FacetedFilter<TData> {
  name: string
  title: string
  options: FacetedFilterOption[]
  isMultiple?: boolean
  matchField?: string
  renderField?: string
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  facetedFilters?: FacetedFilter<TData>[]
  query: string
  setQuery: (value: string) => void
  showSearch?: boolean
  showView?: boolean
}

export function DataTableToolbar<TData>({
  table,
  facetedFilters = [],
  query,
  setQuery,
  showSearch = true,
  showView = true,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters?.length > 0

  return (
    <div className="flex md:flex-row items-center justify-between">
      <div className="flex flex-wrap md:flex-nowrap gap-2  md:gap-3 flex-1 items-center justify-between">
        {showSearch && (
          <div>
            <Input
              placeholder={'Search...'}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              className="h-8 bg-white dark:bg-neutral-800"
            />
          </div>
        )}
        <div className="flex flex-wrap md:space-x-2 md:gap-0  gap-1">
          {Array.isArray(facetedFilters) &&
            facetedFilters?.map((facetedFilter) => (
              <DataTableFacetedFilter
                key={facetedFilter.name}
                column={table.getColumn(facetedFilter?.name)}
                title={facetedFilter?.title}
                options={facetedFilter?.options}
                isMultiple={facetedFilter?.isMultiple}
                matchField={facetedFilter?.matchField || ''}
                renderField={facetedFilter?.renderField || ''}
              />
            ))}
          {isFiltered && (
            <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 border-dashed my-1">
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        {showView && <DataTableViewOptions table={table} />}
      </div>
    </div>
  )
}
