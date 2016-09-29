// Return a list of {text, tag, type, data}.
// `type` is which token matcher is applied (integer, number, word, …).
// `text` is the original piece of string that is matched.
// `tag` is what the token represents in the graph: a lowercase version of the
//   piece of string matched, or the type of a parameter (a non-word).
// `data` is compiled from the text. Its format is type-dependent.
function parse(text, tokenMatchers) {
  let tokens = new Tokens(text)
  while (tokens.remain()) {
    let whitespace = /\S/.exec(tokens.rest())
    if (whitespace !== null) {
      tokens.advance(whitespace.index)  // Ignore whitespace.
    }
    let matched = false
    let matchersLen = tokenMatchers.length
    for (let i = 0; i < matchersLen; i++) {
      // match is {tag, length, data}
      let match = tokenMatchers[i](tokens)
      if (match !== undefined) {
        tokens.token(match.tag, match.length, match.data)
        matched = true
        break
      }
    }
    // Advance by one character if nothing matched.
    if (!matched) { tokens.advance() }
  }
  return tokens.tokens
}

function Tokens(text) {
  this.text = text
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
  tag: function(type, data) {
    let text = this.text.slice(this.tokenStart, this.index)
    this.tokens.push({
      tag: (type === 'word') ? text.toLowerCase() : type,
      type: type,
      text: text,
      data: data,
    })
  },
  // type: type of the token,
  // n: number of characters that the token spans.
  // data: information compiled about the token; its format depends on the type.
  token: function(type, n, data) {
    this.startToken()
    this.advance(n)
    this.tag(type, data)
  },
  // Return the last token currently generated.
  last: function() {
    return this.tokens[this.tokens.length - 1]
  },
}

// Each matcher returns true if it matched something.

function word(tokens) {
  let rest = tokens.rest()
  let match = /^\S+/.exec(rest)
  if (match !== null) {
    return {
      tag: 'word',
      length: match[0].length,
    }
  }
}

const basicTokenMatchers = [
  // Time is harder to match than integer and number, so it is first.
  require('./time.js').time,
  // Number is harder to match than integer, so it is first.
  require('./number.js').number,
  require('./number.js').integer,
  word,
]

parse.defaultTokenMatchers = function() {
  return basicTokenMatchers.slice()
}

module.exports = parse
