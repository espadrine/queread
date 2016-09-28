exports.integer =
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

exports.number =
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
