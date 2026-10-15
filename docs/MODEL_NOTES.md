# Model Notes

## Probability Lab

The Probability Lab is an explainable football-statistics demo built from synthetic event data. It is not a bookmaker feed and does not recommend wagers or stake sizes.

### Inputs

- Current score from validated goal events
- Expected goals from validated shot events
- Current match minute
- Team identity from the canonical event stream

### Poisson projection

For remaining goals, the model uses an independent Poisson distribution:

```text
P(k goals) = e^(-lambda) * lambda^k / k!
```

`lambda` is the team's expected goals scaled by the remaining share of the match. Home and away score probabilities are multiplied to estimate scoreline outcomes, then summed into home win, draw, and away win probabilities.

### Fair odds

The displayed fair odds are the reciprocal of model probability:

```text
fair odds = 1 / probability
```

They are a mathematical presentation of model probability, not live market odds or advice.

### Limits

- The model assumes independent goal processes.
- It does not include bookmaker prices, injuries, lineups, weather, historical league priors, or real Premier League data.
- Model confidence should be treated as an evidence-confidence signal, not a guarantee.
- All hackathon demonstrations must continue to use synthetic football-realistic data.
