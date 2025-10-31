'use client'

import React from 'react'

type ProductData = {
  id?: string | number
  title?: string | unknown
  country?:
    | {
        title?: string | unknown
      }
    | unknown
  status?: string | unknown
  [key: string]: unknown
}

interface ProductInfoFormProps {
  data: ProductData | null
  onSuccess: () => void
}

const ProductInfoForm: React.FC<ProductInfoFormProps> = ({ data, onSuccess }) => {
  return (
    <div>
      <p>Edit product form for {String(data?.title || 'N/A')}</p>
      <button onClick={onSuccess} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Update
      </button>
    </div>
  )
}

export default ProductInfoForm
