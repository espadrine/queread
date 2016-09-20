`queread` — natural language interactive bot library.

```js
const Queread = require('queread')
let bot = new Queread(dataset)
bot.guess('Get me to Madrid.')
// { label: 'search', parameters: [{ destination: 'Madrid' }] }
```

# Workings
*Compiles* examples into a directed graph with edges weighted by the number of
example queries walking through them, one weight for each label.

*Guesses* the meaning of a new query by computing the probability of its label,
by seeing how much of the graph this query walks through.

It is O(n^2) in space in terms of the number of important words in examples, and
linear in time in terms of the size of the query.
