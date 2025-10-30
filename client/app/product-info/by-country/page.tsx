import React from 'react'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import ProductInfoTable from '@/components/product-info/productInfoTable'
import { Suspense } from 'react'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Product Info by Country', link: '' },
          ]}
        />

        <ProductInfoTable />
      </Suspense>
    </>
  )
}

export default page
