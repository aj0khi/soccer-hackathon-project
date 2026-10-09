# Azure for Students Setup

This is the lowest-cost path for testing the Second Story cloud integration.

## 1. Activate the account

Use an eligible academic email to activate [Azure for Students](https://azure.microsoft.com/en-us/free/students/). The offer currently advertises Azure credit and does not require a credit card, subject to Microsoft's eligibility and offer terms.

## 2. Install and sign in

Install the Azure CLI, then run:

```bash
az login
az account list --output table
az account set --subscription <subscription-id>
```

## 3. Create the resource group

Choose a nearby region and keep all hackathon resources in one group:

```bash
az group create --name second-story-rg --location <azure-region>
```

## 4. Deploy the event stream

The template defaults to the Basic Event Hubs tier:

```bash
az deployment group create \
  --resource-group second-story-rg \
  --template-file infra/main.bicep \
  --parameters eventHubNamespaceName=second-story-events-<unique-suffix>
```

Use the deployment outputs to set these values in `.env.local`:

```text
AZURE_EVENT_HUB_NAMESPACE=<namespace>.servicebus.windows.net
AZURE_EVENT_HUB_NAME=match-events
AZURE_EVENT_HUB_CONSUMER_GROUP=$Default
```

## 5. Clean up

When you are finished testing, remove the entire resource group to stop resource charges:

```bash
az group delete --name second-story-rg --yes --no-wait
```

Check the Azure Cost Management page before and after testing. Free-credit eligibility, quotas, regions, and product availability are controlled by Microsoft and can change.
