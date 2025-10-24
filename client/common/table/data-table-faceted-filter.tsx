import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Column } from '@tanstack/react-table'

type Option = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  icon?: React.ComponentType<{ className?: string }>
}

interface DataTableFacetedFilterProps<TData> {
  column: Column<TData, unknown> | undefined
  title: string
  options: Option[]
  isMultiple?: boolean
  renderField: string
  matchField: string
}

export function DataTableFacetedFilter<TData>({
  column,
  title,
  options,
  isMultiple = true,
  renderField,
  matchField,
}: DataTableFacetedFilterProps<TData>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set<string | number>(column?.getFilterValue() as (string | number)[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed my-1">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  Array.isArray(options) &&
                  options
                    .filter((option) => selectedValues.has(option[matchField]))
                    .map((option) => (
                      <Badge variant="secondary" key={option[matchField]} className="rounded-sm px-1 font-normal">
                        {option[renderField]}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {Array.isArray(options) &&
                options.map((option) => {
                  const isSelected = selectedValues.has(option[matchField])
                  return (
                    <CommandItem
                      key={option[matchField]}
                      onSelect={() => {
                        if (isSelected) {
                          selectedValues.delete(option[matchField])
                        } else {
                          if (!isMultiple) selectedValues.clear() // if it is not multiple select then clear the value and insert another
                          selectedValues.add(option[matchField])
                        }
                        const filterValues = Array.from(selectedValues)
                        column?.setFilterValue(filterValues.length ? filterValues : undefined)
                      }}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-neutral-800 dark:border-neutral-50',
                          isSelected ? 'bg-neutral-50 text-neutral-900' : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        {isSelected && <CheckIcon className={cn('h-4 w-4')} />}
                      </div>
                      {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                      <span>{option[renderField]}</span>
                      {facets?.get(option[matchField]) && (
                        <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                          {facets.get(option[matchField])}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
