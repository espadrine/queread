const assert = require('assert')
const tokenize = require('../src/tokenizer/tokenize.js')

function run() {
  let tokenMatchers = tokenize.defaultTokenMatchers()
  let tokens

  tokens = tokenize(' Sample WORDS  ', tokenMatchers)
  assert.equal(tokens.length, 2, 'Parse two words correctly')
  assert.equal(tokens[0].type, 'word', 'Read the first word')
  assert.equal(tokens[0].text, 'Sample', 'Read the first word text')
  assert.equal(tokens[0].tag, 'sample', 'Read the first word tag')
  assert.equal(tokens[0].data, undefined, 'The first word has no data')
  assert.equal(tokens[1].type, 'word', 'Read the second word')
  assert.equal(tokens[1].text, 'WORDS', 'Read the second word text')
  assert.equal(tokens[1].tag, 'words', 'Read the second word tag')
  assert.equal(tokens[1].data, undefined, 'The second word has no data')

  tokens = tokenize('22 000', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated integer')
  assert.equal(tokens[0].type, 'integer', 'Integer type')
  assert.equal(tokens[0].text, '22 000', 'Integer text')
  assert.equal(tokens[0].tag, 'integer', 'Integer tag')
  assert.equal(tokens[0].data, 22000, 'Integer data')

  tokens = tokenize('2nd', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated ordered integer')
  assert.equal(tokens[0].type, 'integer', 'Ordered integer type')
  assert.equal(tokens[0].text, '2nd', 'Ordered integer text')
  assert.equal(tokens[0].tag, 'integer', 'Ordered integer tag')
  assert.equal(tokens[0].data, 2, 'Ordered integer data')
  assert(tokens[0].data.ordered, 'Ordered integer data: ordered set')

  tokens = tokenize('fiftieth', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated "fiftieth"')
  assert.equal(tokens[0].type, 'integer', '"fiftieth" type')
  assert.equal(tokens[0].text, 'fiftieth', '"fiftieth" text')
  assert.equal(tokens[0].tag, 'integer', '"fiftieth" tag')
  assert.equal(tokens[0].data, 50, '"fiftieth" data')
  assert(tokens[0].data.ordered, '"fiftieth" data: ordered set')

  tokens = tokenize('thirteenth', tokenMatchers)
  assert.equal(tokens[0].data, 13, '"thirteenth" data')
  assert(tokens[0].data.ordered, '"thirteenth" data: ordered set')

  tokens = tokenize('twelfth', tokenMatchers)
  assert.equal(tokens[0].data, 12, '"twelfth" data')
  assert(tokens[0].data.ordered, '"twelfth" data: ordered set')

  tokens = tokenize('one million three hundred and thirty-seven thousand four hundred and twenty-seventh', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated long integer')
  assert.equal(tokens[0].type, 'integer', 'long integer type')
  assert.equal(tokens[0].text, 'one million three hundred and thirty-seven thousand four hundred and twenty-seventh', 'long integer text')
  assert.equal(tokens[0].tag, 'integer', 'long integer tag')
  assert.equal(tokens[0].data, 1337427, 'long integer data')
  assert(tokens[0].data.ordered, 'long integer data: ordered set')

  tokens = tokenize('propreantepenultimate', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated propreantepenultimate')
  assert.equal(tokens[0].type, 'integer', 'propreantepenultimate type')
  assert.equal(tokens[0].text, 'propreantepenultimate', 'propreantepenultimate text')
  assert.equal(tokens[0].tag, 'integer', 'propreantepenultimate tag')
  assert.equal(tokens[0].data, -5, 'propreantepenultimate data')
  assert(tokens[0].data.ordered, 'propreantepenultimate data: ordered set')

  tokens = tokenize('the last', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated last')
  assert.equal(tokens[0].type, 'integer', 'last type')
  assert.equal(tokens[0].text, 'the last', 'last text')
  assert.equal(tokens[0].tag, 'integer', 'last tag')
  assert.equal(tokens[0].data, -1, 'last data')
  assert(tokens[0].data.ordered, 'last data: ordered set')

  tokens = tokenize('second to last', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated second to last')
  assert.equal(tokens[0].type, 'integer', 'second to last type')
  assert.equal(tokens[0].text, 'second to last', 'second to last text')
  assert.equal(tokens[0].tag, 'integer', 'second to last tag')
  assert.equal(tokens[0].data, -2, 'second to last data')
  assert(tokens[0].data.ordered, 'second to last data: ordered set')

  tokens = tokenize('22, 000 .15', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated number')
  assert.equal(tokens[0].type, 'number', 'Number type')
  assert.equal(tokens[0].text, '22, 000 .15', 'Number text')
  assert.equal(tokens[0].tag, 'number', 'Number tag')
  assert.equal(tokens[0].data, 22000.15, 'Number data')

  tokens = tokenize('09:30', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse 09:30 time')
  assert.equal(tokens[0].type, 'time', '09:30 time type')
  assert.equal(tokens[0].text, '09:30', '09:30 time text')
  assert.equal(tokens[0].tag, 'time', '09:30 time tag')
  assert.equal(tokens[0].data.hour, 9, '09:30 time hour data')
  assert.equal(tokens[0].data.minute, 30, '09:30 time minute data')

  tokens = tokenize('5h 22', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse 5h 22 time')
  assert.equal(tokens[0].type, 'time', '5h 22 time type')
  assert.equal(tokens[0].text, '5h 22', '5h 22 time text')
  assert.equal(tokens[0].tag, 'time', '5h 22 time tag')
  assert.equal(tokens[0].data.hour, 5, '5h 22 time hour data')
  assert.equal(tokens[0].data.minute, 22, '5h 22 time minute data')

  tokens = tokenize('9pm', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse 9pm time')
  assert.equal(tokens[0].type, 'time', '9pm time type')
  assert.equal(tokens[0].text, '9pm', '9pm time text')
  assert.equal(tokens[0].tag, 'time', '9pm time tag')
  assert.equal(tokens[0].data.hour, 21, '9pm time hour data')
  assert.equal(tokens[0].data.minute, 0, '9pm time minute data')

  tokens = tokenize('at 4', tokenMatchers)
  assert.equal(tokens.length, 2, 'Parse "at 4" time')
  assert.equal(tokens[1].type, 'time', '4 time type')
  assert.equal(tokens[1].text, '4', '4 time text')
  assert.equal(tokens[1].tag, 'time', '4 time tag')
  assert.equal(tokens[1].data.hour, 16, '4 time hour data')
  assert.equal(tokens[1].data.minute, 0, '4 time minute data')

  tokens = tokenize('11/9', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse 11/9 time')
  assert.equal(tokens[0].type, 'time', '11/9 time type')
  assert.equal(tokens[0].text, '11/9', '11/9 time text')
  assert.equal(tokens[0].tag, 'time', '11/9 time tag')
  assert.equal(tokens[0].data.month, 9, '11/9 time minute data')
  assert.equal(tokens[0].data.day, 11, '11/9 time hour data')

  tokens = tokenize('11/9/2001', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse 11/9/2001 time')
  assert.equal(tokens[0].type, 'time', '11/9/2001 time type')
  assert.equal(tokens[0].text, '11/9/2001', '9/11 time text')
  assert.equal(tokens[0].tag, 'time', '11/9/2001 time tag')
  assert.equal(tokens[0].data.year, 2001, '11/9/2001 time year data')
  assert.equal(tokens[0].data.month, 9, '11/9/2001 time minute data')
  assert.equal(tokens[0].data.day, 11, '11/9/2001 time hour data')

  tokens = tokenize('october', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse october time')
  assert.equal(tokens[0].type, 'time', 'october time type')
  assert.equal(tokens[0].text, 'october', 'october time text')
  assert.equal(tokens[0].tag, 'time', 'october time tag')
  assert.equal(tokens[0].data.month, 10, 'october time month data')

  tokens = tokenize('12th August 2023', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse 12th August 2023 time')
  assert.equal(tokens[0].type, 'time', '12th August 2023 time type')
  assert.equal(tokens[0].text, '12th August 2023', '12th August 2023 time text')
  assert.equal(tokens[0].tag, 'time', '12th August 2023 time tag')
  assert.equal(tokens[0].data.year, 2023, '12th August 2023 time year data')
  assert.equal(tokens[0].data.month, 8, '12th August 2023 time month data')
  assert.equal(tokens[0].data.day, 12, '12th August 2023 time day data')

  tokens = tokenize('May 1 2038', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse May 1 2038 time')
  assert.equal(tokens[0].type, 'time', 'May 1 2038 time type')
  assert.equal(tokens[0].text, 'May 1 2038', 'May 1 2038 time text')
  assert.equal(tokens[0].tag, 'time', 'May 1 2038 time tag')
  assert.equal(tokens[0].data.year, 2038, 'May 1 2038 time year data')
  assert.equal(tokens[0].data.month, 5, 'May 1 2038 time month data')
  assert.equal(tokens[0].data.day, 1, 'May 1 2038 time day data')

  tokens = tokenize('Friday', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse Friday time')
  assert.equal(tokens[0].type, 'time', 'Friday time type')
  assert.equal(tokens[0].text, 'Friday', 'Friday time text')
  assert.equal(tokens[0].tag, 'time', 'Friday time tag')
  assert.equal(tokens[0].data.weekDay, 5, 'Friday time week day data')

  tokens = tokenize('the last Friday of 2016', tokenMatchers)
  assert.equal(tokens.length, 2, 'Parse last Friday of 2016 time')
  assert.equal(tokens[1].type, 'time', 'last Friday of 2016 time type')
  assert.equal(tokens[1].text, 'Friday of 2016', 'last Friday of 2016 time text')
  assert.equal(tokens[1].tag, 'time', 'last Friday of 2016 time tag')
  assert.equal(tokens[1].data.year, 2016, 'last Friday of 2016 time year data')
  assert.equal(tokens[1].data.month, 12, 'last Friday of 2016 time month data')
  assert.equal(tokens[1].data.day, 30, 'last Friday of 2016 time day data')

  tokens = tokenize('the last Friday of November of 2016', tokenMatchers)
  assert.equal(tokens.length, 2, 'Parse last Friday of November of 2016 time')
  assert.equal(tokens[1].type, 'time', 'last Friday of November of 2016 time type')
  assert.equal(tokens[1].text, 'Friday of November of 2016', 'last Friday of November of 2016 time text')
  assert.equal(tokens[1].tag, 'time', 'last Friday of November of 2016 time tag')
  assert.equal(tokens[1].data.year, 2016, 'last Friday of November of 2016 time year data')
  assert.equal(tokens[1].data.month, 11, 'last Friday of November of 2016 time month data')
  assert.equal(tokens[1].data.day, 25, 'last Friday of November of 2016 time day data')

  let now = new Date()
  let beforeYesterday = new Date(+now - 2 * 24 * 3600 * 1000)
  tokens = tokenize('day before yesterday', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse the day before yesterday time')
  assert.equal(tokens[0].type, 'time', 'the day before yesterday time type')
  assert.equal(tokens[0].text, 'day before yesterday', 'the day before yesterday time text')
  assert.equal(tokens[0].tag, 'time', 'the day before yesterday time tag')
  assert.equal(tokens[0].data.year, beforeYesterday.getUTCFullYear(),
    'the day before yesterday time year data')
  assert.equal(tokens[0].data.month, beforeYesterday.getUTCMonth() + 1,
    'the day before yesterday time month data')
  assert.equal(tokens[0].data.day, beforeYesterday.getUTCDate(),
    'the day before yesterday time day data')

  tokens = tokenize('last Monday', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse last Monday time')
  assert.equal(tokens[0].type, 'time', 'last Monday time type')
  assert.equal(tokens[0].text, 'last Monday', 'last Monday time text')
  assert.equal(tokens[0].tag, 'time', 'last Monday time tag')
  let lastMonday = dateFromData(tokens[0].data)
  assert.equal(lastMonday.getUTCDay(), 1, 'last Monday time year, month, day data')

  tokens = tokenize('on tuesday', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse on tuesday time')
  assert.equal(tokens[0].type, 'time', 'on tuesday time type')
  assert.equal(tokens[0].text, 'on tuesday', 'on tuesday time text')
  assert.equal(tokens[0].tag, 'time', 'on tuesday time tag')
  let nextTuesday = dateFromData(tokens[0].data)
  assert.equal(nextTuesday.getUTCDay(), 2, 'on tuesday time year, month, day data')

  tokens = tokenize('next week', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse next week time')
  assert.equal(tokens[0].type, 'time', 'next week time type')
  assert.equal(tokens[0].text, 'next week', 'next week time text')
  assert.equal(tokens[0].tag, 'time', 'next week time tag')
  let nextWeek = dateFromData(tokens[0].data)
  assert(+nextWeek - now <= 7 * 24 * 3600 * 1000, 'next week is within a week')
  assert(+nextWeek > now, 'next week is in the future')

  tokens = tokenize('end of year', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse end of year time')
  assert.equal(tokens[0].type, 'time', 'end of year time type')
  assert.equal(tokens[0].text, 'end of year', 'end of year time text')
  assert.equal(tokens[0].tag, 'time', 'end of year time tag')
  let endOfYear = new Date(`${now.getUTCFullYear()}-12-31Z`)
  assert.equal(tokens[0].data.year, endOfYear.getUTCFullYear(),
    'end of year time year')
  assert.equal(tokens[0].data.month, endOfYear.getUTCMonth() + 1,
    'end of year time month')
  assert.equal(tokens[0].data.day, endOfYear.getUTCDate(),
    'end of year time day')
  assert.equal(tokens[0].data.hour, endOfYear.getUTCHours(),
    'end of year time hour')
  assert.equal(tokens[0].data.minute, endOfYear.getUTCMinutes(),
    'end of year time hour')
  assert.equal(tokens[0].data.second, endOfYear.getUTCSeconds(),
    'end of year time hour')
}

// Converts {year, month, …} to a Date.
function dateFromData(data) {
  let {year, month, day, hour, minute, second} = data
  year = year || 0
  let monthStr = String(month || 1)
  if (monthStr.length === 1) { monthStr = '0' + monthStr }
  let dayStr = String(day || 1)
  if (dayStr.length === 1) { dayStr = '0' + dayStr }
  let hourStr = String(hour || 0)
  if (hourStr.length === 1) { hourStr = '0' + hourStr }
  let minuteStr = String(minute || 0)
  if (minuteStr.length === 1) { minuteStr = '0' + minuteStr }
  let secondStr = String(second || 0)
  if (secondStr.length === 1) { secondStr = '0' + secondStr }
  return new Date(`${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}`)
}

exports.run = run
