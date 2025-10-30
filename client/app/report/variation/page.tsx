import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import VariationTable from '@/components/variation/variation-table'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Variation', link: '' },
          ]}
        />
        <Header title={'Variation'} />
        <VariationTable />
      </Suspense>
    </>
  )
}

export default page
