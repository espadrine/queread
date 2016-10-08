exports.integer =
function integer(tokens) {
  let rest = tokens.rest()
  let int = /^([0-9][0-9 ]*)((st|nd|rd|th)\b)?/
  let match = int.exec(rest)
  if (match !== null) {
    let data = +match[1].replace(/ /g, '')
    if (match[3] !== null) {
      data = new Number(data)
      data.ordered = true
    }
    return {
      tag: 'integer',
      length: match[0].length,
      data: data,
    }
  }

  // words such as "one", "first", …
  let tokenSize = 0
  let matched = 0  // Number of characters we have accepted in rest.
  let numbers = []  // List of number words, eg: twenty-three → [20, 3] → 23.

  let humanSmallInt = /^(one|first|two|twen|second|three|thir|third|four|five|fif|six|seven|eight?|nine|ten|eleven|twelve|twelf)/i
  let humanInt = /^(hundred|thousand|(?:m|b|t|quadr|quint|sext|sept|oct|non|(?:un|duo|tre|quattuor|quin|sex?|septen|octo|nove[mn])?dec|vigint|cent)illion)/i

  let intFound = false     // There was an int matched in there.
  let intWordFound = false // The current word is an int.
  let intOrdered = false   // one = not ordered, first = ordered.

  do {
    intWordFound = false
    let text = rest.slice(matched)

    match = humanSmallInt.exec(text)
    if (match !== null) {
      let data = intFromHumanInt[match[0]]
      matched += match[0].length
      if ((match = /^teen(th)?\b/i.exec(rest.slice(matched))) !== null) {
        data += 10
        if (match[1] !== null) { intOrdered = true }
        numbers.push(data)
        matched += match[0].length
        intWordFound = true
      } else if ((match = /^t(y|ieth)\b/i.exec(rest.slice(matched))) !== null) {
        data *= 10
        if (match[1] === 'ieth') { intOrdered = true }
        numbers.push(data)
        matched += match[0].length
        intWordFound = true
      } else if ((match = /^.(th)?\b/i.exec(rest.slice(matched - 1))) !== null) {
        if (match[1] !== null) { intOrdered = true }
        numbers.push(data)
        matched += match[0].length - 1
        intWordFound = true
      }
    } else {

      match = humanInt.exec(text)
      if (match !== null) {
        let data = intFromHumanInt[match[0]]
        matched += match[0].length
        if ((match = /^.(th)?\b/i.exec(rest.slice(matched - 1))) !== null) {
          if (match[1] !== null) { intOrdered = true }
          numbers.push(data)
          matched += match[0].length - 1
          intWordFound = true
        }
      }
    }

    // Skip whitespace.
    if (intWordFound) {
      intFound = true
      tokenSize = matched

      let whitespace = /^\s*(?:and|-)?\s*/.exec(rest.slice(matched))
      if (whitespace !== null) {
        matched += whitespace[0].length  // Ignore whitespace.
      }
    }
  } while (intWordFound)

  if (intFound) {
    let data = intFromNumbers(numbers)
    if (intOrdered) {
      data = new Number(data)
      data.ordered = true
    }
    return {
      tag: 'integer',
      length: tokenSize,
      data,
    }
  }
}

// Input: [20, 3], output: 23.
function intFromNumbers(numbers) {
  if (numbers.length === 0) { return }

  // Find the largest number.
  let max = numbers[0]
  let maxi = 0  // max index
  numbers.forEach((n, i) => {if (max < n) { max = n; maxi = i }})

  // Compute the corresponding prior number.
  let priorNumber = intFromNumbers(numbers.slice(0, maxi))
  if (priorNumber === undefined) { priorNumber = 1 }
  let posteriorNumber = intFromNumbers(numbers.slice(maxi + 1))
  if (posteriorNumber === undefined) { posteriorNumber = 0 }

  return priorNumber * max + posteriorNumber
}

let intFromHumanInt = {
  one: 1,
  first: 1,
  two: 2,
  twen: 2,
  second: 2,
  three: 3,
  thir: 3,
  third: 3,
  four: 4,
  five: 5,
  fif: 5,
  six: 6,
  seven: 7,
  eight: 8,
  eigh: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  twelf: 12,
  hundred: 100,
  thousand: 1e3,
  million: 1e6,
  billion: 1e9,
  trillion: 1e12,
  quadrillion: 1e15,
  quintillion: 1e18,
  sextillion: 1e21,
  septillion: 1e24,
  octillion: 1e27,
  nonillion: 1e30,
  decillion: 1e33,
  undecillion: 1e36,
  duodecillion: 1e39,
  tredecillion: 1e42,
  quattuordecillion: 1e45,
  quindecillion: 1e48,
  sexdecillion: 1e51,
  sedecillion: 1e51,
  septendecillion: 1e54,
  octodecillion: 1e57,
  novemdecillion: 1e60,
  novendecillion: 1e60,
  vigintillion: 1e63,
  centillion: 1e303,
}

exports.number =
function number(tokens) {
  // Get all numbers together.
  let num = /^([0-9][0-9 ,]*)( *\.[0-9 ]*[0-9])/
  let match = num.exec(tokens.rest())
  if (match !== null) {
    let data = +match[0].replace(/[ ,]/g, '')
    return {
      tag: 'number',
      length: match[0].length,
      data: data,
    }
  }
  // FIXME: words such as "half", "a hundredth", …
}
