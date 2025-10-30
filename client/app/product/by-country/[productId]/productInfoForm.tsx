'use client'

import React, { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react'
import axios from 'axios'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import CustomModal from '@/common/CustomModal'
import CustomForm from '@/common/CustomForm'
// import { SWRInfiniteKeyedMutator } from 'swr/infinite'

// ------------------------------
// Types
// ------------------------------
interface ApiResponse<T> {
  data: T[]
  count?: number
  message?: string
}

interface Country {
  _id: string
  title: string
}

const validationSchema = Yup.object({
  remark: Yup.string().optional(),
  localPartner: Yup.string().required('Local partner is required'),
  expApprovalDate: Yup.string().required('Expected approval date is required'),
  submissionDate: Yup.string().required('Submission date is required'),
  expLaunchDate: Yup.string().required('Expected launch date is required'),
  dossier: Yup.string().required('Dossier is required'),
  sample: Yup.string().required('Sample is required'),
  country: Yup.string().required('Country name is required.'),
})

// ✅ infer PreRegistration type directly from schema
type PreRegistration = Yup.InferType<typeof validationSchema> & {
  product: string
  stage?: string
}

interface ProductInfoFormProps {
  setShowModal: Dispatch<SetStateAction<boolean>>
  showModal: boolean
  mutate: () => void
  mode: 'add' | 'edit'
  setMode: Dispatch<SetStateAction<'add' | 'edit'>>
  id: string | null
  setId: Dispatch<SetStateAction<string | null>>
  data: Partial<PreRegistration> | null
  setData: Dispatch<SetStateAction<Partial<PreRegistration> | null>>
  countryId: string
  addProductId: string | null
  productId: string | null
  setProductId: React.Dispatch<React.SetStateAction<string | null>>
}

// ------------------------------
// Utils
// ------------------------------
const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await axios.get<T>(url)
  return res.data
}

const options = [
  { name: 'Submitted', value: 'submitted' },
  { name: 'Not Submitted', value: 'not-submitted' },
]

// ------------------------------
// Component
// ------------------------------
const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
  setShowModal,
  showModal,
  mutate,
  mode,
  setMode,
  id,
  setId,
  data,
  setData,
  //   countryId,
  addProductId,
  //   productId,
  //   setProductId,
}) => {
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId')
    if (storedCompanyId) setCompanyId(storedCompanyId)
  }, [])

  const { data: countries } = useSWR<ApiResponse<Country>>(
    companyId ? `/api/country/get?listLess=true&companyId=${companyId}` : null,
    fetcher
  )

  const resolver = yupResolver(validationSchema) as unknown as Resolver<PreRegistration>

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<PreRegistration>({
    resolver,
    defaultValues: {
      product: addProductId || '',
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

  const fields = useMemo(() => {
    return [
      {
        name: 'country' as const,
        label: 'Country Name',
        placeholder: 'Enter country name',
        fieldType: 'select' as const,
        options: countries?.data?.map((c) => ({ _id: c._id, title: c.title })) ?? [],
        matchField: '_id',
        renderField: 'title',
      },
      {
        name: 'submissionDate' as const,
        label: 'Submission Date',
        placeholder: 'Enter submission date',
        fieldType: 'date' as const,
        type: 'date',
      },
      {
        name: 'expApprovalDate' as const,
        label: 'Expected Approval Date',
        placeholder: 'Enter registration date',
        fieldType: 'date' as const,
        type: 'date',
      },
      {
        name: 'expLaunchDate' as const,
        label: 'Expected Launch Date',
        placeholder: 'Enter expected launch date',
        fieldType: 'date' as const,
        type: 'date',
      },
      {
        name: 'dossier' as const,
        label: 'Dossier',
        placeholder: 'Enter dossier',
        fieldType: 'select' as const,
        options: options as unknown as Record<string, unknown>[],
        matchField: 'value',
        renderField: 'name',
      },
      {
        name: 'sample' as const,
        label: 'Sample',
        placeholder: 'Enter sample',
        fieldType: 'select' as const,
        options: options as unknown as Record<string, unknown>[],
        matchField: 'value',
        renderField: 'name',
      },
      {
        name: 'localPartner' as const,
        label: 'Local Partner',
        placeholder: 'Enter local partner',
      },
      {
        name: 'remark' as const,
        label: 'Remark',
        placeholder: 'Enter remark',
        fieldType: 'textarea' as const,
        rows: 4,
      },
    ]
  }, [countries])

  useEffect(() => {
    if (mode === 'edit' && data) {
      fields.forEach(({ name }) => {
        const key = name as keyof PreRegistration
        if (data[key] !== undefined) setValue(key, data[key]!)
      })
    } else {
      reset()
    }
  }, [data, fields, mode, setValue, reset])

  const onSubmit: SubmitHandler<PreRegistration> = async (formData) => {
    try {
      if (mode === 'add') {
        const { data: res } = await axios.post('/api/preregistration', formData)
        toast.success(res?.message || 'Pre-registration added successfully')
      } else {
        const { data: res } = await axios.put(`/api/product/update/${id}`, formData)
        toast.success(res?.message || 'Product updated successfully')
        setMode('add')
        setId(null)
        setData(null)
      }

      mutate()
      setShowModal(false)
      reset()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'An error occurred')
      } else {
        toast.error('Unexpected error')
      }
    }
  }

  return (
    <div className="w-full">
      <CustomModal
        show={showModal}
        setShow={setShowModal}
        showSaveBtn
        saveBtnText={mode === 'add' ? 'Submit' : 'Update'}
        isSubmitting={isSubmitting}
        onSave={handleSubmit(onSubmit)}
        title={`${mode === 'add' ? 'Add' : 'Update'} PreRegistration`}
        content={
          <CustomForm<PreRegistration>
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
    </div>
  )
}

export default ProductInfoForm
