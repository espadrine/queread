// The tokenizer reads a string of words. It returns a list of words
// (potentially with spaces, eg. because `12, 99 €` was a single token, not
// a list of three separate words), and for each word, a list of tags that it
// maps to.
// Warning: this file is highly localized. You may need different primitives for
// languages other than English.

// Return a list of {text, tag, type, data}.
// `type` is which token matcher is applied (integer, number, word, …).
// `text` is the original piece of string that is matched.
// `tag` is what the token represents in the graph: a lowercase version of the
//   piece of string matched, or the type of a parameter (a non-word).
// `data` is compiled from the text. Its format is type-dependent.
function parse(text) {
  let tokens = new Tokens(text)
  while (tokens.remain()) {
    let whitespace = /\S/.exec(tokens.rest())
    if (whitespace !== null) {
      tokens.advance(whitespace.index)  // Ignore whitespace.
    }
    let matched = false
    let matchersLen = parse.tokenMatchers.length
    for (let i = 0; i < matchersLen; i++) {
      // match is {tag, length, data}
      let match = parse.tokenMatchers[i](tokens)
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

function integer(tokens) {
  let int = /^[0-9]|[0-9][0-9 ]*[0-9](?:st|nd|rd|th)?\b/
  let match = int.exec(tokens.rest())
  if (match !== null) {
    let data = +match[0].replace(/ /g, '')
    return {
      tag: 'integer',
      length: match[0].length,
      data: data,
    }
  }
  // FIXME: words such as "one", "first", …
  let humanSmallInt = /^(one|first|two|twen|second|three|thir|third|four|five|fif|six|seven|eight?|nine|ten|eleven|twelve|twelf)/i
  let humanInt = /^(a |the )?(hundred|thousand|(?:m|b|t|quadr|quint|sext|sept|oct|non|(?:un|duo|tre|quattuor|quin|sex?|septen|octo|nove[mn])?dec|vigint|cent)illion)(?: and |-)?/i
}

function number(tokens) {
  // Get all numbers together.
  let num = /^([0-9]|[0-9][0-9 ]*[0-9])( *[\.,] *[0-9 ]*[0-9])?\b/
  let match = num.exec(tokens.rest())
  if (match !== null) {
    let data = +match[0].replace(/ /g, '').replace(',', '.')
    return {
      tag: 'number',
      length: match[0].length,
      data: data,
    }
  }
  // FIXME: words such as "half", "a hundredth", …
}

function time(tokens) {
  // First, hour / minutes / seconds information.

  let time = /^([0-9]?[0-9]) *[:hH] *([0-9][0-9])/  // 20:30
  let match = time.exec(tokens.rest())
  if (match !== null) {
    let data = {
      hour: +match[1],
      minute: +match[2],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // am / pm / h
  let int = integer(tokens)
  let num = number(tokens)
  if (int !== undefined || num !== undefined) {
    if (num === undefined) { num = int }
    let time = /^ *(am|pm|h)\b/
    match = time.exec(tokens.text.slice(tokens.index + num.length))
    if (match !== null) {
      let hour = (num.data >>> 0)
      let minute = num.data - hour
      if (match[1] === 'pm') {
        hour += 12
      }
      let data = { hour: hour, minute: minute }
      return {
        tag: 'time',
        length: num.length + match[0].length,
        data: data,
      }
    }
  }
  // "at 4" meaning 4pm.
  let previousToken = tokens.last()
  if (previousToken && previousToken.type === 'word'
      && previousToken.tag === 'at') {
    if (int !== undefined) {
      let data = {}
      if (int.data >= 24 && int.data <= 2460) {
        // Compact time: 1230 for 12:30.
        data.hour = Math.floor(int.data / 100)
        data.minute = int.data - data.hour
      } else if (int.data > 2460) {
        // Compact time with seconds: 123014 for 12:30:14.
        data.hour = Math.floor(int.data / 10000)
        data.minute = Math.floor((int.data - data.hour) / 100)
        data.second = int.data - data.hour - data.minute
      } else if (int.data < 6) {
        data.hour = 12 + int.data
      } else {
        data.hour = +int.data
      }
      return {
        tag: 'time',
        length: int.length,
        data: data,
      }
    }
  }

  // Now, calendar date information.
  let date = /^([0-9]+)-(0[1-9]|10|11|12)-([0-2][0-9]|30|31)/
  match = date.exec(tokens.rest())
  if (match !== null) {
    let data = {
      year: +match[1],
      month: +match[2],
      day: +match[3],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // British form first.
  let britishDate = /^([0-2][0-9]|30|31)\/(0[1-9]|10|11|12)\/([0-9]+)/
  match = britishDate.exec(tokens.rest())
  if (match !== null) {
    let year = +match[3]
    if (year < 100) { year += 2000 }
    let data = {
      year: year,
      month: +match[2],
      day: +match[1],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // American form.
  let americanDate = /^(0[1-9]|10|11|12)\/([0-2][0-9]|30|31)\/([0-9]+)/
  match = americanDate.exec(tokens.rest())
  if (match !== null) {
    let year = +match[3]
    if (year < 100) { year += 2000 }
    let data = {
      year: year,
      month: +match[1],
      day: +match[2],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // Day - month.
  let calDate = /^([0-2][0-9]|30|31)-(0[1-9]|10|11|12)/
  match = calDate.exec(tokens.rest())
  if (match !== null) {
    let data = {
      month: +match[2],
      day: +match[1],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // Day / month. British form.
  let britishCalDate = /^([0-2][0-9]|30|31)\/(0[1-9]|10|11|12)/
  match = britishCalDate.exec(tokens.rest())
  if (match !== null) {
    let data = {
      month: +match[2],
      day: +match[1],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // Month / day. American form.
  let americanCalDate = /^(0[1-9]|10|11|12)\/([0-2][0-9]|30|31)/
  match = americanCalDate.exec(tokens.rest())
  if (match !== null) {
    let data = {
      month: +match[1],
      day: +match[2],
    }
    return {
      tag: 'time',
      length: match[0].length,
      data: data,
    }
  }
  // More flexible format.
  let humanMonth = /^(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/i
  // 12th august 2023, May 1 2038
  let humanWeek = /^(tue|wed|thu|sat|(?:mon|tues|wednes|thurs|fri|satur|sun)(?:day)?)\b/i
  let humanRelativeDay = /^(yesterday|today|tomorrow)\b/i
  let humanRelative = /^(second|minute|hour|day|week|month|year)s?\b/i
  // last, next, on, ago, start / end of the, in two, week 12
  // FIXME: see https://github.com/mojombo/chronic#examples
}

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

parse.tokenMatchers = [
  // Time is harder to match than integer and number, so it is first.
  time,
  // Number is harder to match than integer, so it is first.
  number,
  integer,
  word,
]

module.exports = parse
