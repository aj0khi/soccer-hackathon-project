targetScope = 'resourceGroup'

@description('Azure region for the Event Hubs namespace.')
param location string = resourceGroup().location

@description('Globally unique Event Hubs namespace name.')
param eventHubNamespaceName string

@description('Name of the match event hub.')
param eventHubName string = 'match-events'

@description('Consumer group used by the Second Story event source.')
param consumerGroupName string = '$Default'

@description('Event Hubs pricing tier.')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param skuName string = 'Basic'

@description('Event Hubs namespace capacity units.')
param skuCapacity int = 1

resource eventHubNamespace 'Microsoft.EventHub/namespaces@2024-01-01' = {
  name: eventHubNamespaceName
  location: location
  sku: {
    name: skuName
    tier: skuName
    capacity: skuCapacity
  }
  properties: {
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    project: 'second-story'
    dataClassification: 'synthetic-football-events'
  }
}

resource matchEvents 'Microsoft.EventHub/namespaces/eventhubs@2024-01-01' = {
  parent: eventHubNamespace
  name: eventHubName
  properties: {
    messageRetentionInDays: 1
    partitionCount: 2
  }
}

resource consumerGroup 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2024-01-01' = {
  parent: matchEvents
  name: consumerGroupName
}

output eventHubNamespaceName string = eventHubNamespace.name
output eventHubNamespaceFqdn string = '${eventHubNamespace.name}.servicebus.windows.net'
output eventHubName string = matchEvents.name
output consumerGroupName string = consumerGroup.name
