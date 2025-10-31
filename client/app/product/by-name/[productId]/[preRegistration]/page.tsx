'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

// import RenewalHistory from "@/components/RenewalHistory/RenewalHistory";
import VariationHistoryTable from '@/components/variation/variationHistory'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import PreRegistration from '@/components/pre-registration/pre-registration'
import RenewalHistoryTable from '@/components/renewal/renewalHistory'
// import { RenewalForm } from '@/components/renewal/renewalForm'
interface Country {
  _id?: string
  title?: string
}

interface Product {
  _id?: string
  title?: string
}

interface RenewalData {
  id?: string | number | undefined
  stage?: string
  product?: { title?: string }
  country?: { title?: string }
  approval?: string
  POS?: string
  notificationNumber?: string
  renewDate?: string | Date
  [key: string]: unknown
}

export default function ProductDetails() {
  // const router = useRouter()
  const { preRegistration: preregistrationId } = useParams() as {
    // productId: string
    preRegistration: string
  }

  const [country, setCountry] = useState<Country | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const setCountryTitle = (val: string | undefined) => setCountry(val ? { title: val } : null)
  const setProductTitle = (val: string | undefined) => setProduct(val ? { title: val } : null)
  const [registrationDate, setRegistrationDate] = useState<string | null>(null)
  const setRegistrationDateTitle = (val: string | undefined) => setRegistrationDate(val || null)
  // const [showRenewalModal, setShowRenewalModal] = useState(false)
  // const [renewalMode, setRenewalMode] = useState<'add' | 'edit'>('add')
  // const [renewalId, setRenewalId] = useState<string | number | null>(null)
  // const [renewalData, setRenewalData] = useState<RenewalData | null>(null)

  // const onEditRenewal = (rowData: RenewalData) => {
  //   setRenewalMode('edit')
  //   setRenewalId(rowData.id ?? null)
  //   setRenewalData(rowData)
  //   setShowRenewalModal(true)
  // }

  console.log(registrationDate)

  // Example for handling navigation state — in Next.js you might pass it as a query param instead
  const from = typeof window !== 'undefined' ? sessionStorage.getItem('from') : null

  const breadcrumbs =
    from === 'product-by-countries'
      ? [
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Product By Country', link: `/by-countries/${country?._id}` },
          { name: country?.title || '', link: `/by-countries/${country?._id}` },
          { name: 'Product Detail', link: '' },
        ]
      : [
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Product', link: '/products' },
          { name: product?.title || '', link: `/products/${product?._id}` },
          { name: 'Product Detail', link: '' },
        ]

  return (
    <div className="p-4 space-y-6">
      {/* Breadcrumbs */}
      <CustomBreadcrumbs list={breadcrumbs} />

      {/* Product Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold truncate">{product?.title}</h2>
        <h3 className="text-lg font-medium text-blue-600 truncate">{country?.title}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PreRegistration */}
        <div className="lg:col-span-3 sticky top-24 h-fit">
          <PreRegistration
            preregistrationId={preregistrationId}
            setCountry={setCountryTitle}
            setProduct={setProductTitle}
            setRegistrationDate={setRegistrationDateTitle}
          />
        </div>

        {/* Right: Histories */}
        <div className="lg:col-span-9 space-y-6">
          <VariationHistoryTable
            preregistrationId={preregistrationId}
            // preregistrationId="68c9358871ae6329f8acc9e7"
          />

          <div className="lg:col-span-9 space-y-6"></div>
          {/* <RenewalHistoryTable preregistrationId={preregistrationId} onEdit={onEditRenewal} /> */}
          <RenewalHistoryTable preregistrationId={preregistrationId} onEdit={() => {}} />
        </div>
      </div>

      {/* <RenewalForm
        showModal={showRenewalModal}
        setShowModal={setShowRenewalModal}
        mode={renewalMode}
        setMode={setRenewalMode}
        id={renewalId}
        setId={setRenewalId}
        data={renewalData}
        setData={setRenewalData}
        mutate={() => {
          // Could trigger refresh of RenewalHistoryTable if needed
        }}
      /> */}
    </div>
  )
}

// 'use client'

// import React from 'react'

// const productDetails: React.FC = () => {
//   return (
//     <div>
//       <h1>productDetails</h1>
//     </div>
//   )
// }

// export default productDetails
