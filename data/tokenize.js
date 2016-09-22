// The parameter parser reads a string of words. It returns a list of words
// (potentially with spaces, eg. because `12, 99 €` was a single parameter, not
// a list of three separate words), and for each word, a list of tags that it
// maps to.

function Tokens(text) {
  this.text = text
  this.outputList = []
  this.index = 0
  this.tokenStart = 0  // Starting index of a token.
  this.tokens = []
}

Tokens.prototype = {
  peek: function(n) {
    n = n || 0
    return this.text[this.index + n]
  },
  advance: function(n) {
    if (n === undefined) { n = 1 }
    this.index += n
  },
  remain: function() { return this.index <= this.text.length },
  rest: function() { return this.text.slice(this.index) },
  startToken: function() { this.tokenStart = this.index },
  tag: function(tag) {
    let text = this.text.slice(this.tokenStart, this.index)
    this.tokens.push({
      tag: (tag === 'word') ? text.toLowerCase() : tag,
      type: tag,
      text: text,
    })
  },
  token: function(tag, n) {
    this.startToken()
    this.advance(n)
    this.tag(tag)
  },
}

// Return a list of {text, tag, type}.
function parse(text) {
  let tokens = new Tokens(text)
  while (tokens.remain()) {
    let whitespace = /\S/.exec(tokens.rest())
    if (whitespace !== null) {
      tokens.advance(whitespace.index)  // Ignore whitespace.
    }
    let matched = false
    let matchersLen = parse.parameterMatchers.length
    for (let i = 0; i < matchersLen; i++) {
      if (parse.parameterMatchers[i](tokens)) { matched = true; break }
    }
    // Advance by one character if nothing matched.
    if (!matched) { tokens.advance() }
  }
  return tokens.tokens
}

// Each matcher returns true if it matched something.

function integer(tokens) {
  let int = /^[0-9]|[0-9][0-9\s]*[0-9]/
  let rest = tokens.rest()
  let match = int.exec(rest)
  if (match !== null) {
    tokens.token('integer', match[0].length)
    return true
  }
  // TODO: words such as "one", "first", …
}

function number(tokens) {
  // Get all numbers together.
  let num = /^([0-9]|[0-9][0-9\s]*[0-9])(\s*[\.,]\s*[0-9\s]*[0-9])?/
  let rest = tokens.rest()
  let match = num.exec(rest)
  if (match !== null) {
    tokens.token('number', match[0].length)
    return true
  }
}

function word(tokens) {
  let rest = tokens.rest()
  let match = /^\S+/.exec(rest)
  if (match !== null) {
    tokens.token('word', match[0].length)
    return true
  }
}

parse.parameterMatchers = [
  // Number is harder to match than integer, so it is first.
  number,
  integer,
  word,
]

module.exports = parse
