import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import RecycleBinTable from '@/components/recycle-bin/recycle-bin-table'
import React from 'react'
import { Suspense } from 'react'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Recycle Bin', link: '' },
          ]}
        />

        <RecycleBinTable />
      </Suspense>
    </>
  )
}

export default page
