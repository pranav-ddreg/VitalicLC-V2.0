'use client'

import React, { useRef, useState } from 'react'
import { useRenewalHistoryColumns } from './renewalHistoryColumns'
import { DataTable } from '@/common/table/data-table'
import axios from 'axios'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { toast } from 'react-hot-toast'
import CustomForm from '@/common/CustomForm'
import CustomModal from '@/common/CustomModal'
import { useEffect } from 'react'
import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'

interface RenewalFormProps {
  setShowModal: (v: boolean) => void
  showModal: boolean
  mutate: () => void
  mode: 'add' | 'edit'
  setMode: (m: 'add' | 'edit') => void
  id: string | number | null
  setId: (v: string | number | null) => void
  data: RenewalData | null
  setData: (v: RenewalData | null) => void
}

type FormValues = {
  remark: string
  expInitiateDate: string
  expSubmitDate: string
  initiateDate: string
  submitDate: string
  renewDate: string
  stage: string
  POS?: string
  approvalPdf: File | null
  posPdf: File | null
}

type RenewalData = {
  id?: string | number | undefined
  stage?: string
  product?: { title?: string }
  country?: { title?: string }
  approval?: string
  POS?: string
  notificationNumber?: string
  renewDate?: string | Date
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validationSchema: Yup.ObjectSchema<any> = Yup.object({
  expInitiateDate: Yup.string().required(),
  expSubmitDate: Yup.string().required(),
  initiateDate: Yup.string().when('stage', {
    is: (isCompany: string) => isCompany === 'initiate',
    then: () => Yup.string().required('initiate Date is required'),
    otherwise: () => Yup.string(),
  }),
  submitDate: Yup.string().when('stage', {
    is: (isCompany: string) => isCompany === 'submit',
    then: () => Yup.string().required('Submit Date is required'),
    otherwise: () => Yup.string(),
  }),
  renewDate: Yup.string().when('stage', {
    is: (isCompany: string) => isCompany === 'renew',
    then: () => Yup.string().required('Renew Date is required'),
    otherwise: () => Yup.string(),
  }),
  approvalPdf: Yup.mixed().when('stage', {
    is: (isCompany: string) => isCompany === 'renew',
    then: () =>
      Yup.mixed()
        .required('Approval pdf is required')
        .test('fileType', 'Only Pdf are allowed', (value: unknown) =>
          value && typeof value === 'object' && 'type' in value && (value as { type: string }).type
            ? ['application/pdf'].includes((value as { type: string }).type)
            : true
        ),
    otherwise: () => Yup.mixed().nullable(),
  }),
  posPdf: Yup.mixed().when('stage', {
    is: (isCompany: string) => isCompany === 'renew',
    then: () =>
      Yup.mixed()
        .required('POS is required')
        .test('fileType', 'Only Pdf are allowed', (value: unknown) =>
          value && typeof value === 'object' && 'type' in value && (value as { type: string }).type
            ? ['application/pdf'].includes((value as { type: string }).type)
            : true
        ),
    otherwise: () => Yup.mixed().nullable(),
  }),

  stage: Yup.string().required('Stage  is required'),
})

const stageOptions = [
  {
    name: 'Initiate',
    value: 'initiate',
  },
  {
    name: 'Submit',
    value: 'submit',
  },
  {
    name: 'Renew',
    value: 'renew',
  },
]

export function RenewalForm({
  setShowModal,
  showModal,
  mutate,
  mode,
  setMode,
  id,
  setId,
  data,
  setData,
}: RenewalFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    reset,
    setValue,
    clearErrors,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      remark: '',
      expInitiateDate: '',
      expSubmitDate: '',
      initiateDate: '',
      submitDate: '',
      renewDate: '',
      stage: '',
      POS: '',
      approvalPdf: null,
      posPdf: null,
    },
  })

  const stage = watch('stage')

  const fields = [
    {
      name: 'remark',
      label: 'Remark',
      placeholder: 'Enter remark ',
      fullWidth: true,
    },
    {
      name: 'expSubmitDate',
      label: 'Expected Submit Date',
      placeholder: 'Enter expected submit date',
      type: 'date',
      disabled: true,
    },
    {
      name: 'expInitiateDate',
      label: 'Expected Initiate Date',
      placeholder: 'Enter expected initiate date',
      type: 'date',
      disabled: true,
    },
    {
      name: 'stage',
      label: 'Stage',
      placeholder: 'Enter Stage',
      fieldType: 'select' as const,
      options: stageOptions,
      renderField: 'name',
      matchField: 'value',
    },
    {
      name: 'initiateDate',
      label: 'Initiate Date',
      placeholder: 'Enter Initiate date',
      type: 'date',
      display: stage === 'initiate' || stage === 'renew' || stage === 'submit',
      disabled: stage !== 'initiate',
    },
    {
      name: 'submitDate',
      label: 'Submit Date',
      placeholder: 'Enter Submit date',
      type: 'date',
      display: stage === 'submit' || stage === 'renew',
      disabled: stage !== 'submit',
    },
    {
      name: 'renewDate',
      label: 'Renew Date',
      placeholder: 'Enter Renew date',
      type: 'date',
      display: stage === 'renew',
    },

    {
      name: 'posPdf',
      label: 'Upload (POS)',
      placeholder: 'Upload POS ',
      fieldType: 'file' as const,
      height: '100px',
      display: stage === 'renew',
    },
    {
      name: 'approvalPdf',
      label: 'Upload (Approval)',
      placeholder: 'Upload Approval Pdf ',
      fieldType: 'file' as const,
      height: '100px',
      display: stage === 'renew',
    },
  ]

  useEffect(() => {
    if (mode === 'edit') {
      clearErrors()
      setValue(
        'expInitiateDate',
        data?.['expInitiateDate']
          ? new Date(data['expInitiateDate'] as string | number | Date).toISOString().toString().substring(0, 10)
          : ''
      )
      setValue(
        'expSubmitDate',
        data?.['expSubmitDate']
          ? new Date(data['expSubmitDate'] as string | number | Date).toISOString().toString().substring(0, 10)
          : ''
      )
      setValue(
        'initiateDate',
        data?.['initiateDate']
          ? new Date(data['initiateDate'] as string | number | Date).toISOString().toString().substring(0, 10)
          : ''
      )
      setValue(
        'submitDate',
        data?.['submitDate']
          ? new Date(data['submitDate'] as string | number | Date).toISOString().toString().substring(0, 10)
          : ''
      )
      setValue(
        'renewDate',
        data?.['renewDate']
          ? new Date(data['renewDate'] as string | number | Date).toISOString().toString().substring(0, 10)
          : ''
      )

      setValue('posPdf', data?.['posPdf'] as File | null)
      setValue('approvalPdf', data?.['approvalPdf'] as File | null)
      setValue('remark', String(data?.remark ?? ''))

      if (data?.['stage'] !== 'registered') setValue('stage', String(data?.['stage'] ?? ''))
      else setValue('stage', '')
    } else {
      reset()
    }
  }, [data, mode, setValue, reset, clearErrors])

  const onSubmit = async (formData: FormValues) => {
    try {
      if (mode === 'add') {
        const { data } = await axios.post('/api/company', {
          ...formData,
        })
        toast.success(data?.message)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (axios as any).putForm(`/api/renewal/update/${id}`, {
          ...formData,
        })

        toast.success(data?.message)
        setMode('add')
        setId(null)
        setData(null)
      }
      mutate()
      setShowModal(false)
      reset()
    } catch (err) {
      toast.error((err as Error)?.message ?? 'An unexpected error occurred')
    }
  }

  return (
    <CustomModal
      show={showModal}
      setShow={setShowModal}
      showSaveBtn={true}
      onSave={handleSubmit(onSubmit)}
      saveBtnText={mode === 'add' ? 'Submit' : 'Update'}
      isSubmitting={isSubmitting}
      title={`${mode === 'add' ? 'Add' : 'Update'} Renewal`}
      content={
        <CustomForm
          control={control}
          mode={mode}
          isSubmitting={isSubmitting}
          fields={fields}
          showSubmitBtn={false}
          size="lg"
        />
      }
      size="lg"
    />
  )
}

export default function RenewalPage() {
  const formRef = useRef<HTMLDivElement | null>(null)

  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [showModal, setShowModal] = useState(false)
  const [id, setId] = useState<string | number | null>(null)
  const [data, setData] = useState<RenewalData | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  //  Handle edit click from table
  const handleEdit = (rowData: RenewalData) => {
    setMode('edit')
    setId(rowData.id ?? null)
    setData(rowData)
    setShowModal(true)

    // 👇 scroll form into view
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  const columns = useRenewalHistoryColumns(handleEdit)

  // 🧠 Mock data example — replace with your fetched data
  const tableData: RenewalData[] = [
    {
      id: 1,
      stage: 'Renew',
      product: { title: 'Product A' },
      country: { title: 'India' },
      approval: 'Yes',
      POS: 'POS_01',
      notificationNumber: 'NF-123',
      renewDate: '2025-01-15T10:00:00Z',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Form Section */}
      <div ref={formRef}>
        <RenewalForm
          showModal={showModal}
          setShowModal={setShowModal}
          mode={mode}
          setMode={setMode}
          id={id}
          setId={setId}
          data={data}
          setData={setData}
          mutate={() => {}}
        />
      </div>

      {/* Table Section */}
      <div className="mt-8">
        <DataTable
          columns={columns}
          data={tableData}
          pagination={pagination}
          setPagination={setPagination}
          count={tableData.length}
          sorting={sorting}
          setSorting={setSorting}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </div>
    </div>
  )
}
