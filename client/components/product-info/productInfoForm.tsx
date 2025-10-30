'use client'

import React from 'react'

interface ProductInfoFormProps {
  data: any
  onSuccess: () => void
}

const ProductInfoForm: React.FC<ProductInfoFormProps> = ({ data, onSuccess }) => {
  return (
    <div>
      <p>Edit product form for {data?.title || 'N/A'}</p>
      <button onClick={onSuccess} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Update
      </button>
    </div>
  )
}

export default ProductInfoForm
