// PEGS2 hosting: Azure Static Web App for the Vite build output.
// Deploy at resource-group scope (target: the pegs2 resource group).
targetScope = 'resourceGroup'

@description('Name of the Static Web App.')
param name string = 'pegs2'

@description('Static Web Apps is only offered in a few regions.')
@allowed([
  'centralus'
  'eastus2'
  'westus2'
  'westeurope'
  'eastasia'
])
param location string = 'eastus2'

@allowed([
  'Free'
  'Standard'
])
param sku string = 'Free'

@description('Optional custom domain (e.g. pegs.korzaan.com). Its CNAME must already point at the app\'s default hostname, or the deployment fails validation. Leave empty to skip.')
param customDomain string = ''

param tags object = {
  app: 'pegs2'
}

resource site 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    // Content is pushed by GitHub Actions with a deployment token,
    // not by a repo link managed by Azure.
    provider: 'Other'
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Disabled'
  }
}

resource domain 'Microsoft.Web/staticSites/customDomains@2023-12-01' = if (!empty(customDomain)) {
  parent: site
  name: empty(customDomain) ? 'placeholder' : customDomain
  properties: {}
}

output name string = site.name
output defaultHostname string = site.properties.defaultHostname
