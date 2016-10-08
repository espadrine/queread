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
  let humanSmallInt = /^(one|first|two|twen|second|three|thir|third|four|five|fif|six|seven|eight?|nine|ten|eleven|twelve|twelf)/i
  match = humanSmallInt.exec(rest)
  if (match !== null) {
    let data = intFromHumanInt[match[0]]
    let matched = match[0].length
    if ((match = /^teen(th)?\b/i.exec(rest.slice(matched))) !== null) {
      data += 10
      if (match[1] !== null) {
        data = new Number(data)
        data.ordered = true
      }
      return {
        tag: 'integer',
        length: matched + match[0].length,
        data,
      }
    } else if ((match = /^t(y|ieth)\b/i.exec(rest.slice(matched))) !== null) {
      data *= 10
      if (match[1] === 'ieth') {
        data = new Number(data)
        data.ordered = true
      }
      return {
        tag: 'integer',
        length: matched + match[0].length,
        data,
      }
    } else if ((match = /^.(th)?\b/i.exec(rest.slice(matched - 1))) !== null) {
      if (match[1] !== null) {
        data = new Number(data)
        data.ordered = true
      }
      return {
        tag: 'integer',
        length: matched + match[0].length,
        data,
      }
    }
  }

  let humanInt = /^(a |the )?(hundred|thousand|(?:m|b|t|quadr|quint|sext|sept|oct|non|(?:un|duo|tre|quattuor|quin|sex?|septen|octo|nove[mn])?dec|vigint|cent)illion)(?: and |-)?/i
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

let intFromHumanInt = {
  one: 1,
  first: 1,
  two: 2,
  tween: 2,
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
}
