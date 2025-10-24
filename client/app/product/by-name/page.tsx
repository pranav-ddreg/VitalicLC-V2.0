import React, { Suspense } from 'react'
import Product from '@/components/by-name/page'
export const metadata = {
  title: 'Products by Name - Vitalic LC',
  description: '',
}

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Product />
    </Suspense>
  )
}

export default page
