'use client'

import React, { Dispatch, SetStateAction } from 'react'

// Keep these types in sync with pre-registration.tsx. Ideally, move them to a shared types file.
interface ApiItem {
  apiSourceAddress?: string
  apiSourceMethod?: string
  apiSourceName?: string
}

interface LocalPartner {
  partnerName?: string
}

export interface PreRegistrationData {
  _id: string
  stage?: string
  dossier?: string
  sample?: string
  renewalDate?: string
  localPartner?: LocalPartner[] | string
  registrationNo?: string
  notificationNumber?: string
  submissionDate?: string
  remark?: string
  registeredArtworkCarton?: string
  registeredArtworkOuterCarton?: string
  registeredArtworkPackageInsert?: string
  registeredArtworkLabel?: string
  SKUCode?: string
  CIC?: string
  shelfLife?: string
  siteGMP?: string
  api?: ApiItem[]
  batchSize?: string
  modeOfRegistration?: string
  modeOfVersion?: string
  packSize?: string
  storageCondition?: string
  country?: string
  product?: string
  registrationDate?: string
}

export interface PreRegistrationResponse {
  data: PreRegistrationData
}

interface PreRegistrationFormProps {
  // Usage A (form modal controller)
  showModal?: boolean
  setShowModal?: Dispatch<SetStateAction<boolean>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate?: any // KeyedMutator<PreRegistrationResponse>
  mode?: 'add' | 'edit'
  setMode?: Dispatch<SetStateAction<'add' | 'edit'>>
  id?: string | null
  setId?: Dispatch<SetStateAction<string | null>>
  data?: PreRegistrationData | null
  setData?: Dispatch<SetStateAction<PreRegistrationData | null>>

  // Usage B (embedded on product details page)
  preregistrationId?: string
  // setCountry?: Dispatch<SetStateAction<any>>
  // setProduct?: Dispatch<SetStateAction<any>>
  // setRegistrationDate?: Dispatch<SetStateAction<any>>
}

const PreRegistrationForm: React.FC<PreRegistrationFormProps> = ({
  showModal,
  setShowModal,
  // mutate,
  mode,
  // setMode,
  // id,
  // setId,
  // data,
  // setData,
  preregistrationId,
  // setCountry,
  // setProduct,
  // setRegistrationDate,
}) => {
  // Placeholder UI; replace with actual form implementation.
  return (
    <div>
      {/* Example usage of props to avoid unused warnings */}
      {showModal && (
        <div>
          <h2>Pre-Registration Form ({mode})</h2>
          {setShowModal && <button onClick={() => setShowModal(false)}>Close</button>}
        </div>
      )}

      {/* Render basic info when used on product details page */}
      {preregistrationId && (
        <div>
          <p>Pre-registration ID: {preregistrationId}</p>
        </div>
      )}
    </div>
  )
}

export default PreRegistrationForm
