'use client'

import React from 'react'

interface ProductFormProps {
  onSuccess: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
  return (
    <div>
      <p>Add new product form placeholder</p>
      <button onClick={onSuccess} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  )
}

export default ProductForm
