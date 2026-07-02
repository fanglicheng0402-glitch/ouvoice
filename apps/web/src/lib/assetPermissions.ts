export interface AssetPermissions {
  privateStorage: boolean
  culturalHeritage: boolean
  academicUse: boolean
  commercialTraining: boolean
}

export const defaultAssetPermissions: AssetPermissions = {
  privateStorage: true,
  culturalHeritage: true,
  academicUse: true,
  commercialTraining: true,
}

export const sovereignRecallPermissions: AssetPermissions = {
  privateStorage: true,
  culturalHeritage: false,
  academicUse: false,
  commercialTraining: false,
}

export const permissionRates = {
  privateStorage: 0,
  culturalHeritage: 0.10,
  academicUse: 0.50,
  commercialTraining: 1.50,
} as const

export const maximumAssetAuthorizationValue = 2.10

export function calculateCurrentAssetRate(permissions: AssetPermissions) {
  return Number((
    (permissions.privateStorage ? permissionRates.privateStorage : 0)
    + (permissions.culturalHeritage ? permissionRates.culturalHeritage : 0)
    + (permissions.academicUse ? permissionRates.academicUse : 0)
    + (permissions.commercialTraining ? permissionRates.commercialTraining : 0)
  ).toFixed(2))
}
