import React, { Suspense } from 'react'
import Product from '@/components/by-country/page'
export const metadata = {
  title: 'Products by Country - Vitalic LC',
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
