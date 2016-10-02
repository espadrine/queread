`queread` — natural language interactive bot library.

```js
const Queread = require('queread')
let bot = new Queread(dataset)
bot.guess('Get me to Madrid.')
// { label: 'search', parameters: [{ destination: 'Madrid' }] }
```

# Workings
*Compiles* examples into a directed graph with edges weighted by the number of
example queries walking through them, one weight for each label. This ensures
that words can be missing from a query, but still be matched to an example. Word
order matters to the probability of a correct guess.

*Guesses* the meaning of a new query by computing the probability of its label,
by seeing how much of the graph this query walks through.
The basic formula for probability computation is the following:

    Count(query, label) = Σi (walked_link(query)[i][label])
    Pr(query, label) = Count(query, label) / Σl (Count(query, l))

It is O(n^2) in space in terms of the number of important words in examples, and
linear in time in terms of the size of the query.

# Dataset
We receive the list of examples in the JSON format returned by
`bot.parse(fileContent)`. Each example is on a separate line of the following
form:

    label: Some text with /words/ and parameters [type] [name].

First, the line starts with a label to which the example corresponds. Then, the
example is written in plain text, with some markup to highlight important words
(like `/so/`), and to highlight parameters: the type comes first, the name (or
names) afterwards. If only the type is specified, its name is the name of the
type.

To specify a parameter that includes spaces, you can use the same markup as
important words: `here is a /parameter with words/ [type] [name]`.
