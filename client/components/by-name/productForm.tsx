'use client'
import React, { useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import toast from 'react-hot-toast'

import CustomModal from '@/common/CustomModal'
import CustomForm from '@/common/CustomForm'

// ✅ Validation schema
const validationSchema = Yup.object({
  title: Yup.string().required('Product name is required.'),
})

// ✅ Form field configuration
const fields = [
  {
    name: 'title',
    label: 'Product Name',
    placeholder: 'Enter product name',
  },
]

// ✅ Types
interface ProductFormValues {
  title: string
}

interface ProductFormProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  showModal: boolean
  mutate: () => void
  mode: 'add' | 'edit'
  setMode: React.Dispatch<React.SetStateAction<'add' | 'edit'>>
  id: string | null
  setId: React.Dispatch<React.SetStateAction<string | null>>
  data: Partial<ProductFormValues> | null
  setData: React.Dispatch<React.SetStateAction<Partial<ProductFormValues> | null>>
  productId?: string | null
  setProductId?: React.Dispatch<React.SetStateAction<string | null>>
}

const ProductForm: React.FC<ProductFormProps> = ({
  setShowModal,
  showModal,
  mutate,
  mode,
  setMode,
  id,
  setId,
  data,
  setData,
  setProductId,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { title: '' },
  })

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && data) {
      fields.forEach(({ name }) => {
        setValue(name as keyof ProductFormValues, data[name as keyof ProductFormValues] || '')
      })
    } else {
      reset()
    }
  }, [data, mode, reset, setValue])

  const onSubmit: SubmitHandler<ProductFormValues> = async (formData) => {
    try {
      if (mode === 'add') {
        const { data: response } = await axios.post<{
          id: string
          message: string
        }>('/api/product/add', formData)
        toast.success(response?.message)
        if (setProductId) setProductId(response?.id) // productId updated
      } else {
        const { data: response } = await axios.put<{ message: string }>(`/api/product/update/${id}`, formData)
        toast.success(response?.message)
        setMode('add')
        setId(null)
        setData(null)
      }

      mutate()
      setShowModal(false)
      reset()
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <CustomModal
      show={showModal}
      setShow={setShowModal}
      showSaveBtn={false}
      saveBtnText={mode === 'add' ? 'Submit' : 'Update'}
      isSubmitting={isSubmitting}
      title={`${mode === 'add' ? 'Add' : 'Update'} Product`}
      content={
        <CustomForm
          size="sm"
          control={control}
          mode={mode}
          isSubmitting={isSubmitting}
          fields={fields}
          showSubmitBtn={true}
          onSubmit={handleSubmit(onSubmit)}
        />
      }
      size="md"
      fullscreen={false}
    />
  )
}

export default ProductForm
