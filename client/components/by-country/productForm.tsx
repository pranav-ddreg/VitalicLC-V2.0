'use client'

import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form'
import * as Yup from 'yup'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import CustomModal from '@/common/CustomModal'
import CustomForm from '@/common/CustomForm'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

// --------------------
// Interfaces
// --------------------
interface Country {
  _id: string
  title: string
}

export interface ProductFormData {
  product: string
  remark?: string
  country: string
  expApprovalDate: string
  submissionDate: string
  expLaunchDate: string
  dossier: string
  sample: string
  localPartner: string
  stage: string
}

const validationSchema: Yup.ObjectSchema<ProductFormData> = Yup.object({
  product: Yup.string().required(),
  remark: Yup.string().optional(),
  localPartner: Yup.string().required('Local partner is required'),
  expApprovalDate: Yup.string().required('Expected approval date is required'),
  submissionDate: Yup.string().required('Submission date is required'),
  expLaunchDate: Yup.string().required('Expected launch date is required'),
  dossier: Yup.string().required('Dossier is required'),
  sample: Yup.string().required('Sample is required'),
  country: Yup.string().required('Country name is required.'),
  stage: Yup.string().required(),
})

const selectOptions = [
  { name: 'Submitted', value: 'submitted' },
  { name: 'Not Submitted', value: 'not-submitted' },
]

// --------------------
// Field Types
// --------------------
type FieldType = 'select' | 'textarea' | 'text' | 'file' | 'multiselect' | 'image' | 'date'

interface FieldOption<T extends FieldValues> {
  name: keyof T
  label: string
  placeholder: string
  type?: string
  fieldType?: FieldType
  options?: { [key: string]: unknown }[]
  matchField?: string
  renderField?: string
  rows?: number
}

// --------------------
// Props
// --------------------
interface ProductFormProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  mutate: () => void
  mode: 'add' | 'edit'
  setMode: React.Dispatch<React.SetStateAction<'add' | 'edit'>>
  id: string | null
  productId: string | null
  setProductId?: React.Dispatch<React.SetStateAction<string | null>>
  setId: React.Dispatch<React.SetStateAction<string | null>>
  data: Partial<ProductFormData> | null
  setData: React.Dispatch<React.SetStateAction<Partial<ProductFormData> | null>>
  showModal: boolean
}

// --------------------
// Component
// --------------------
const ProductInfoForm: React.FC<ProductFormProps> = ({
  setShowModal,
  mutate,
  mode,
  setMode,
  id,
  setId,
  data,
  setData,
  showModal,
}) => {
  const params = useParams()
  const productId = params?.productId as string

  const [companyId] = useState<string>('66efcba1a25b1b72f0347f21')

  const { data: countries } = useSWR<{ data: { data: Country[] } }>(
    companyId ? `/api/country/get?listLess=true&companyId=${companyId}` : null,
    fetcher
  )

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      product: productId,
      remark: '',
      country: '',
      expApprovalDate: '',
      submissionDate: '',
      expLaunchDate: '',
      dossier: '',
      sample: '',
      localPartner: '',
      stage: 'under-process',
    },
  })

  // --------------------
  // Fields Definition
  // --------------------
  const fields: FieldOption<ProductFormData>[] = useMemo(
    () => [
      {
        name: 'country',
        label: 'Country Name',
        placeholder: 'Enter country name',
        fieldType: 'select',
        options: countries?.data?.data?.map((c) => ({ _id: c._id, title: c.title })) ?? [],
        matchField: '_id',
        renderField: 'title',
      },
      {
        name: 'submissionDate',
        label: 'Submission Date',
        placeholder: 'Enter submission date',
        type: 'date',
      },
      {
        name: 'expApprovalDate',
        label: 'Expected Approval Date',
        placeholder: 'Enter registration date',
        type: 'date',
      },
      {
        name: 'expLaunchDate',
        label: 'Expected Launch Date',
        placeholder: 'Enter expected launch date',
        type: 'date',
      },
      {
        name: 'dossier',
        label: 'Dossier',
        placeholder: 'Enter dossier',
        fieldType: 'select',
        options: selectOptions,
        matchField: 'value',
        renderField: 'name',
      },
      {
        name: 'sample',
        label: 'Sample',
        placeholder: 'Enter sample',
        fieldType: 'select',
        options: selectOptions,
        matchField: 'value',
        renderField: 'name',
      },
      {
        name: 'localPartner',
        label: 'Local Partner',
        placeholder: 'Enter local partner',
      },
      {
        name: 'remark',
        label: 'Remark',
        placeholder: 'Enter remark',
        fieldType: 'textarea',
        rows: 4,
      },
    ],
    [countries]
  )

  // --------------------
  // Form Data Handling
  // --------------------
  useEffect(() => {
    if (mode === 'edit' && data) {
      fields.forEach(({ name }) => {
        const value = data[name]
        if (value !== undefined) setValue(name, value as string)
      })
    } else {
      reset()
    }
  }, [data, mode, setValue, reset, fields])

  const onSubmit: SubmitHandler<ProductFormData> = async (formData) => {
    try {
      if (mode === 'add') {
        const response = await axios.post('/api/preregistration', formData)
        toast.success(response.data?.message || 'Successfully added')
      } else {
        const response = await axios.put(`/api/product/update/${id}`, formData)
        toast.success(response.data?.message || 'Successfully updated')
        setMode('add')
        setId(null)
        setData(null)
      }

      mutate()
      setShowModal(false)
      reset()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Something went wrong')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  // --------------------
  // Render
  // --------------------
  return (
    <CustomModal
      show={showModal}
      setShow={setShowModal}
      showSaveBtn
      saveBtnText={mode === 'add' ? 'Submit' : 'Update'}
      isSubmitting={isSubmitting}
      onSave={handleSubmit(onSubmit)}
      title={`${mode === 'add' ? 'Add' : 'Update'} PreRegistration`}
      content={
        <CustomForm<ProductFormData>
          control={control}
          mode={mode}
          isSubmitting={isSubmitting}
          fields={fields}
          showSubmitBtn={false}
          onSubmit={onSubmit}
          handleSubmit={handleSubmit}
        />
      }
      size="md"
      fullscreen
    />
  )
}

export default ProductInfoForm
