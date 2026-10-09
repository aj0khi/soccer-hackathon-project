export interface AzureEventHubConfig {
  fullyQualifiedNamespace: string;
  eventHubName: string;
  consumerGroup: string;
}

export function getAzureEventHubConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AzureEventHubConfig | undefined {
  const fullyQualifiedNamespace = environment.AZURE_EVENT_HUB_NAMESPACE?.trim();
  const eventHubName = environment.AZURE_EVENT_HUB_NAME?.trim();
  if (!fullyQualifiedNamespace || !eventHubName) return undefined;

  return {
    fullyQualifiedNamespace,
    eventHubName,
    consumerGroup: environment.AZURE_EVENT_HUB_CONSUMER_GROUP?.trim() || "$Default",
  };
}
