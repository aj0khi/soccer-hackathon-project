# Azure Infrastructure

This folder provisions the event-ingestion foundation for Second Story. It creates an Azure Event Hubs namespace, the `match-events` hub, and a consumer group for the application.

The template uses synthetic-event tags and does not provision Foundry agents. Foundry project and agent creation depends on the Azure subscription, model deployment, region, and identity chosen by the team; those steps are documented in [`docs/FOUNDRY_MAPPING.md`](../docs/FOUNDRY_MAPPING.md).

## Prerequisites

- Azure CLI installed and authenticated with `az login`
- An Azure subscription and resource group
- A globally unique Event Hubs namespace name

## Deploy

```bash
az account set --subscription <subscription-id>
az group create --name second-story-rg --location <azure-region>
az deployment group create \
  --resource-group second-story-rg \
  --template-file infra/main.bicep \
  --parameters eventHubNamespaceName=<unique-namespace-name>
```

Or use the example parameters file after copying it to a local, untracked file:

```bash
cp infra/main.parameters.example.json infra/main.parameters.json
az deployment group create \
  --resource-group second-story-rg \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json
```

## Connect the app

Use the deployment output to configure `.env.local`:

```text
AZURE_EVENT_HUB_NAMESPACE=<namespace>.servicebus.windows.net
AZURE_EVENT_HUB_NAME=match-events
AZURE_EVENT_HUB_CONSUMER_GROUP=$Default
```

Grant the runtime identity the **Azure Event Hubs Data Receiver** role on the namespace. `DefaultAzureCredential` will use the Azure CLI identity locally and the managed identity in a hosted environment.

Do not commit `infra/main.parameters.json` or any credential material.
