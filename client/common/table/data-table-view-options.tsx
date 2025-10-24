'use client'

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Table as ReactTable } from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useTransition } from 'react'
import { Loader2, ShieldUser, User, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogClose } from '@radix-ui/react-dialog'
import axios from 'axios'
import toast from 'react-hot-toast'

interface DataTableViewOptionsProps<TData> {
  table: ReactTable<TData>
}

interface Form {
  firstName: string
  lastName: string
  role: string
  email: string
  password: string
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const [createDialog, setCreateDialog] = useState(false)

  const form = useForm<Form>({
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      role: '',
      email: '',
    },
  })

  const { register, watch, setValue, handleSubmit } = form
  const [isPending, startTransition] = useTransition()

  const { mutate } = table.options.meta as { mutate: () => void }

  const onSubmit = (data: Form) => {
    startTransition(async () => {
      await axios
        .post('/api/auth/create', data)
        .then((res) => {
          setCreateDialog(false)
          mutate()
          toast.success(res?.data?.message, {
            style: {
              borderRadius: '30px',
              background: '#fff',
              color: '#333',
            },
          })
        })
        .catch(() => toast.error('Failed to create user!'))
    })
  }

  return (
    <>
      <Dialog
        open={createDialog}
        onOpenChange={() => {
          form.reset()
          setCreateDialog(!createDialog)
        }}
      >
        <DialogTrigger asChild>
          <Button size={'sm'} variant={'outline'} className="cursor-pointer">
            <UserPlus /> Add User
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              {`Make changes to your profile here. Click save when
                        you're done.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input id="firstName" className="col-span-3" {...register('firstName')} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input id="lastName" className="col-span-3" {...register('lastName')} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" className="col-span-3" {...register('email')} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select onValueChange={(value) => setValue('role', value)} defaultValue={watch('role')}>
                  <SelectTrigger className="w-full col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <ShieldUser className="mr-2 h-4 w-4" />
                      Admin
                    </SelectItem>
                    <SelectItem value="user">
                      <User className="mr-2 h-4 w-4" />
                      User
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input id="password" type="password" className="col-span-3" {...register('password')} />
              </div>
            </div>

            <DialogFooter>
              <DialogClose
                type="button"
                className={buttonVariants({
                  variant: 'outline',
                  className: 'cursor-pointer',
                })}
                disabled={isPending}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto h-8 flex">
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
