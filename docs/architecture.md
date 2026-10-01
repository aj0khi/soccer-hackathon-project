# Architecture Notes

The project is organized around a provider-neutral pipeline. Azure services can be attached behind these boundaries later without coupling the domain model to a vendor or to a particular user experience.

```text
synthetic events -> event source -> match interpreter -> grounded insights -> experience renderer
```

## Layers

- `src/types`: contracts shared by ingestion, analysis, presentation, and tests.
- `src/application`: orchestration interfaces and use-case boundaries.
- `src/infrastructure`: future adapters for local fixtures, Azure services, or other providers.
- `src/app`: the web experience; its design should be chosen after the product concept is selected.

## Principles

- Synthetic football-realistic data only.
- Raw events remain separate from derived insights and rendered outputs.
- Explanations should carry event identifiers and supporting metrics.
- Providers should implement interfaces rather than leak SDK types into the domain.
- Personalization belongs at the presentation boundary, not in raw event processing.
