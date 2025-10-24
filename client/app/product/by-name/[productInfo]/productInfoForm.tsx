'use client'

import React, { useEffect, useMemo, useState, JSX } from 'react'
import axios from 'axios'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Control, Resolver } from 'react-hook-form'
import * as Yup from 'yup'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'
import { useParams } from 'next/navigation'

import CustomModal from '@/common/CustomModal'
import CustomForm from '@/common/CustomForm'
import CustomArrayField from '@/common/CustomArrayField'

// ------------------- FETCHER -------------------
const fetcher = (url: string) => axios.get(url).then((res) => res.data)

// ------------------- YUP SCHEMA -------------------
const validationSchema = Yup.object({
  product: Yup.string().required('Product is required'),
  remark: Yup.string().nullable().optional(),
  country: Yup.string().required('Country name is required.'),
  apiName: Yup.string().required('Api name is required.'),
  brandName: Yup.string().required('Brand name is required.'),
  localPartner: Yup.array()
    .of(
      Yup.object().shape({
        partnerName: Yup.string(),
      })
    )
    .required(),
})

// ------------------- TYPES -------------------
type FieldType = 'select' | 'textarea' | 'image' | 'text' | 'multiselect' | 'file'

type Field<OptionType extends Record<string, unknown> = Record<string, unknown>> = {
  name: keyof FormDataType
  label: string
  placeholder?: string
  fieldType?: FieldType
  options?: OptionType[]
  matchField?: string
  renderField?: (option: OptionType) => JSX.Element
  rows?: number
}

type FormDataType = {
  product: string
  remark?: string | null
  country: string
  apiName: string
  brandName: string
  localPartner: { partnerName?: string }[]
  stage?: string
}

type ProductDataType = FormDataType & { id?: string }

interface ProductInfoFormProps {
  setShowModal: (show: boolean) => void
  showModal: boolean
  mutate: () => void
  mode: 'add' | 'edit'
  setMode: (mode: 'add' | 'edit') => void
  id: string | null
  setId: (id: string | null) => void
  data: ProductDataType | null
  setData: (data: ProductDataType | null) => void
  addProductId?: string
}

// ------------------- COMPONENT -------------------
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
  addProductId,
}) => {
  const { productId, countryId } = useParams() as { productId?: string; countryId?: string }

  const [user, setUser] = useState<{ company?: { _id?: string } } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/getUser')
        setUser(res.data.user)
      } catch (err) {
        console.error('Failed to fetch user info', err)
      }
    }
    fetchUser()
  }, [])

  const { data: countries } = useSWR(
    user?.company?._id
      ? `/api/country/get?listLess=true&sort=title&order=ascending&companyId=${user?.company?._id}`
      : null,
    fetcher
  )

  // ------------------- RESOLVER -------------------
  const resolver = yupResolver(validationSchema) as unknown as Resolver<FormDataType>

  // ------------------- FORM -------------------
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<FormDataType>({
    resolver,
    defaultValues: {
      product: productId || addProductId || '',
      remark: '',
      country: countryId || '',
      brandName: '',
      apiName: '',
      localPartner: [{ partnerName: '' }],
      stage: 'under-process',
    },
  })

  // ------------------- FORM FIELDS -------------------
  type CountryOption = { _id: string; title: string }

  const fields: Field<CountryOption>[] = useMemo(
    () => [
      {
        name: 'country',
        label: 'Country Name',
        placeholder: 'Enter country name',
        fieldType: 'select',
        options: Array.isArray(countries?.data?.data) ? countries.data.data : [],
        matchField: '_id',
        renderField: (option) => <>{option.title}</>, // JSX wrapper fixes type
      },
      {
        name: 'brandName',
        label: 'Brand Name',
        placeholder: 'Enter brand name',
        fieldType: 'text',
      },
      {
        name: 'apiName',
        label: 'API Name',
        placeholder: 'Enter API name',
        fieldType: 'text',
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

  // ------------------- SET DEFAULTS -------------------
  useEffect(() => {
    const productValue = productId || addProductId
    if (productValue) setValue('product', productValue, { shouldValidate: true })
  }, [productId, addProductId, setValue])

  useEffect(() => {
    if (countryId) setValue('country', countryId, { shouldValidate: true })
  }, [countryId, setValue])

  useEffect(() => {
    if (mode === 'edit' && data) {
      fields.forEach(({ name }) => setValue(name, data[name]))
      if (data?.product) setValue('product', data.product)
    } else {
      const productValue = productId || addProductId
      reset({
        product: productValue || '',
        remark: '',
        country: countryId || '',
        brandName: '',
        apiName: '',
        localPartner: [{ partnerName: '' }],
        stage: 'under-process',
      })
    }
  }, [data, fields, mode, reset, setValue, productId, addProductId, countryId])

  // ------------------- SUBMIT -------------------
  const onSubmit = async (formData: FormDataType) => {
    const finalFormData = { ...formData, product: formData.product || productId || addProductId }
    if (!finalFormData.product) {
      toast.error('Product is required')
      return
    }

    try {
      if (mode === 'add') {
        const { data } = await axios.post('/api/preregistration', finalFormData)
        toast.success(data?.message)
      } else {
        const { data } = await axios.put(`/api/product/update/${id}`, finalFormData)
        toast.success(data?.message)
        setMode('add')
        setId(null)
        setData(null)
      }
      mutate()
      setShowModal(false)
      reset()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Something went wrong')
      } else {
        toast.error('Something went wrong')
      }
    }
  }

  // ------------------- RENDER -------------------
  return (
    <CustomModal
      show={showModal}
      setShow={setShowModal}
      showSaveBtn
      saveBtnText={mode === 'add' ? 'Submit' : 'Update'}
      isSubmitting={isSubmitting}
      onSave={handleSubmit(onSubmit)}
      title={`${mode === 'add' ? 'Add' : 'Update'}`}
      content={
        <>
          <CustomForm
            control={control as unknown as Control<FormDataType>}
            mode={mode}
            isSubmitting={isSubmitting}
            fields={fields as unknown as Field<Record<string, unknown>>[]}
            showSubmitBtn={false}
            onSubmit={(e) => e.preventDefault()}
          />

          <div className="border rounded p-4 my-5 relative">
            <span className="absolute -top-4 left-5 bg-blue-600 text-white px-3 py-1 rounded font-semibold">
              Local Partners
            </span>
            <CustomArrayField
              name="localPartner"
              control={control as unknown as Control<FormDataType>}
              fields={[{ name: 'partnerName', label: 'Local Partner', placeholder: 'Enter local partner' }]}
              addFields={{ partnerName: '' }}
            />
          </div>
        </>
      }
      size="md"
      fullscreen
    />
  )
}

export default ProductInfoForm
