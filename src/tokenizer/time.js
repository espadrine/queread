const numberTokenizers = require('./number.js')
const integer = numberTokenizers.integer
const number = numberTokenizers.number

exports.time =
function time(tokens) {
  let rest = tokens.rest()

  // First, hour / minutes / seconds information.

  let time = /^([0-9]?[0-9]) *[:hH] *([0-9][0-9])/  // 20:30
  let match = time.exec(rest)
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
      let data = {hour, minute}
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
        data.minute = 0
      } else {
        data.hour = +int.data
        data.minute = 0
      }
      return {
        tag: 'time',
        length: int.length,
        data: data,
      }
    }
  }

  // Now, calendar date information.
  let date = /^([0-9]+)-(0?[1-9]|10|11|12)-([0-2][0-9]|30|31)/
  match = date.exec(rest)
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
  let britishDate = /^([0-2]?[0-9]|30|31)\/(0?[1-9]|10|11|12)\/([0-9]+)/
  match = britishDate.exec(rest)
  if (match !== null) {
    let year = +match[3]
    if (year < 100) { year += 2000 }
    let data = {
      year,
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
  let americanDate = /^(0?[1-9]|10|11|12)\/([0-2][0-9]|30|31)\/([0-9]+)/
  match = americanDate.exec(rest)
  if (match !== null) {
    let year = +match[3]
    if (year < 100) { year += 2000 }
    let data = {
      year,
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
  let calDate = /^([0-2]?[0-9]|30|31)-(0?[1-9]|10|11|12)/
  match = calDate.exec(rest)
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
  let britishCalDate = /^([0-2]?[0-9]|30|31)\/(0?[1-9]|10|11|12)/
  match = britishCalDate.exec(rest)
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
  let americanCalDate = /^(0?[1-9]|10|11|12)\/([0-2][0-9]|30|31)/
  match = americanCalDate.exec(rest)
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
  let humanMonth = /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)\b/i
  match = humanMonth.exec(rest)
  if (match !== null) {
    let data = {
      month: monthFromHumanMonth[match[0].slice(0, 3).toLowerCase()],
    }

    let matched = match[0].length
    match = /^ *([0-2]?[0-9]|30|31)(?:st|nd|rd|th)?\b/.exec(rest.slice(matched))
    if (match !== null) {
      // May 1 2038
      matched += match[0].length
      data.day = +match[1]
      match = /^ *-?[0-9]+/.exec(rest.slice(matched))
      if (match !== null) {
        matched += match[0].length
        data.year = +match[0]
        return {
          tag: 'time',
          length: matched,
          data: data,
        }
      } else {
        return {
          tag: 'time',
          length: matched,
          data: data,
        }
      }
    } else {
      return {
        tag: 'time',
        length: matched,
        data: data,
      }
    }
  }

  // 12th august 2023
  if (int !== undefined && int.data < 32) {
    let matched = int.length
    let whitespace = /^\s*/.exec(rest.slice(matched))
    if (whitespace !== null) { matched += whitespace[0].length }
    match = humanMonth.exec(rest.slice(matched))
    if (match !== null) {
      let day = int.data
      let month = monthFromHumanMonth[match[0].slice(0, 3).toLowerCase()]

      matched += match[0].length
      match = /^ *-?[0-9]+/.exec(rest.slice(matched))
      if (match !== null) {
        let year = +match[0]
        return {
          tag: 'time',
          length: matched + match[0].length,
          data: {day, month, year},
        }
      } else {
        return {
          tag: 'time',
          length: matched + match[0].length,
          data: {day, month},
        }
      }
    }
  }

  let humanWeek = /^(tue|wed|thu|sat|(?:mon|tues|wednes|thurs|fri|satur|sun)(?:day)?)\b/i
  match = humanWeek.exec(rest)
  if (match !== null) {
    let data = {}
    let weekDay = weekFromHumanWeek[match[0].slice(0, 3).toLowerCase()]
    let matched = match[0].length
    let previousToken = tokens.last()
    if (previousToken !== undefined && previousToken.tag === 'integer'
        && previousToken.data.ordered) {
      match = /^ +of +/.exec(rest.slice(matched))
      if (match !== null) {
        matched += match[0].length
        match = humanMonth.exec(rest.slice(matched))
        if (match !== null) {
          matched += match[0].length
          data.month = monthFromHumanMonth[match[0].slice(0, 3).toLowerCase()]
          match = /^ +of +(-?[0-9]+)/.exec(rest.slice(matched))
          if (match !== null) {
            matched += match[0].length
            // last monday of december of 2019
            let year = +match[1]
            let month = data.month
            let time = nthWeekDay(previousToken.data, weekDay, year, month)
            data.day = time.getUTCDate()
            data.month = time.getUTCMonth() + 1
            data.year = time.getUTCFullYear()
            return {
              tag: 'time',
              length: matched,
              data,
            }
          }
          // last monday of december
          // Assume current year.
          let now = new Date()
          let curYear = now.getUTCFullYear()
          let month = data.month
          let time = nthWeekDay(previousToken.data, weekDay, curYear, month)
          data.day = time.getUTCDate()
          data.month = time.getUTCMonth() + 1
          data.year = time.getUTCFullYear()
          return {
            tag: 'time',
            length: matched,
            data,
          }
        }
        match = /^-?[0-9]+/.exec(rest.slice(matched))
        if (match !== null) {
          matched += match[0].length
          // last monday of 2019
          let year = +match[0]
          let time = nthWeekDay(previousToken.data, weekDay, year)
          data.day = time.getUTCDate()
          data.month = time.getUTCMonth() + 1
          data.year = time.getUTCFullYear()
          return {
            tag: 'time',
            length: matched,
            data,
          }
        }
      }
    }
    data.weekDay = weekDay
    return {
      tag: 'time',
      length: matched,
      data,
    }
  }

  let humanRelativeDay = /^(?:day (before|after) )?(yesterday|today|tomorrow)\b/i
  match = humanRelativeDay.exec(rest)
  if (match !== null) {
    let timestamp = +new Date()
    timestamp += relativeTime[match[2]]
    if (match[1] !== null) {
      if (match[1] === 'before') {
        timestamp += relativeTime.yesterday
      } else if (match[1] === 'after') {
        timestamp += relativeTime.tomorrow
      }
    }
    let time = new Date(timestamp)
    let year = time.getUTCFullYear()
    let month = time.getUTCMonth() + 1
    let day = time.getUTCDate()
    return {
      tag: 'time',
      length: match[0].length,
      data: {year, month, day},
    }
  }

  let humanRelative = /^(second|minute|hour|day|week|month|year)s?\b/i

  let humanRelativePeriod = /^(last|next|on)\b/
  match = humanRelativePeriod.exec(rest)
  if (match !== null) {
    let now = new Date()
    let backward = (match[0] === 'last')
    let isOn = (match[0] === 'on')
    let matched = match[0].length
    let whitespace = /^\s*/.exec(rest.slice(matched))
    if (whitespace !== null) { matched += whitespace[0].length }

    match = humanWeek.exec(rest.slice(matched))
    if (match !== null) {
      // next saturday
      matched += match[0].length
      let weekDay = weekFromHumanWeek[match[0].slice(0, 3).toLowerCase()]
      let timeDir = 1
      if (backward) { timeDir = -1 }
      let time = nthWeekDay(timeDir, weekDay,
        now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())
      let year = time.getUTCFullYear()
      let month = time.getUTCMonth() + 1
      let day = time.getUTCDate()
      return {
        tag: 'time',
        length: matched,
        data: {year, month, day},
      }
    }

    match = humanRelative.exec(rest.slice(matched))
    if (match !== null && !isOn) {
      // next week
      matched += match[0].length
      let time = new Date(+now + relativeTime[match[1]])
      let year = time.getUTCFullYear()
      let month = time.getUTCMonth() + 1
      let day = time.getUTCDate()
      return {
        tag: 'time',
        length: matched,
        data: {year, month, day},
      }
    }
  }

  // start of month
  let startOfPeriod = /^(start|beginning|end) +of +(?:the +|this +)?(next|last|previous)?\b */
  match = startOfPeriod.exec(rest)
  if (match !== null) {
    let now = new Date()
    let end = match[1]  // start / beginning / end
    let relation = match[2]   // next / last / previous
    let matched = match[0].length
    match = humanRelative.exec(rest.slice(matched))
    if (match !== null) {
      // next week
      matched += match[0].length
      let now = new Date()
      let period = relativeTime[match[1]]
      let factor = 0  // Current period
      if (relation === 'next') {
        factor = 1
      } else if (relation === 'last' || relation === 'previous') {
        factor = -1
      }
      let time = new Date(+now + period * factor)
      let year = time.getUTCFullYear()
      let month = time.getUTCMonth() + 1
      let day = time.getUTCDate()
      let hour = time.getUTCHours()
      let minute = time.getUTCMinutes()
      let second = time.getUTCSeconds()

      if (period > relativeTime.second) { second = 0 }
      if (period > relativeTime.minute) { minute = 0 }
      if (period > relativeTime.hour) { hour = 0 }
      if (period > relativeTime.day) { day = 1 }
      if (period > relativeTime.month) { month = 1 }
      if (end === 'end') {
        if (period > relativeTime.month) {
          month = 12
          day = lastDayOfMonth(time)
        } else if (period > relativeTime.day) { day = lastDayOfMonth(time)
        } else if (period > relativeTime.hour) { hour = 24
        } else if (period > relativeTime.minute) { minute = 60
        } else if (period > relativeTime.second) { second = 60
        }
      }

      return {
        tag: 'time',
        length: matched,
        data: {year, month, day, hour, minute, second},
      }
    }
  }

  // in two months
  if (previousToken && previousToken.type === 'word'
      && previousToken.tag === 'in') {
    if (int !== undefined || num !== undefined) {
      if (num === undefined) { num = int }
      let matched = num.length
      let whitespace = /^\s*/.exec(rest.slice(matched))
      if (whitespace !== null) { matched += whitespace[0].length }
      match = humanRelative.exec(rest.slice(matched))
      if (match !== null) {
        // next week
        matched += match[0].length
        let now = new Date()
        let time = new Date(+now + num.data * relativeTime[match[1]])
        let year = time.getUTCFullYear()
        let month = time.getUTCMonth() + 1
        let day = time.getUTCDate()
        return {
          tag: 'time',
          length: matched,
          data: {year, month, day},
        }
      }
    }
  }

  // ago, week 12
  // FIXME: see https://github.com/mojombo/chronic#examples
}

const monthFromHumanMonth = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

const weekFromHumanWeek = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
}

// eg. second friday of 2015
function nthWeekDay(countDays, weekDay, year, month, day) {
  let countedDays = 0
  if (countDays >= 0) {
    month = month || 1
    let monthStr = String(month)
    if (monthStr.length === 1) { monthStr = "0" + monthStr }
    day = day || 1
    let dayStr = String(day)
    if (dayStr.length === 1) { dayStr = "0" + dayStr }
    // We stay a minute off midnight to avoid dealing with leap seconds.
    let timestamp = +new Date(`${year}-${monthStr}-${dayStr}T00:01:00Z`)
    let time
    for (let i = 0; i < 366; i++) {
      time = new Date(timestamp)
      if (time.getDay() === weekDay) {countedDays++}
      if (countedDays === countDays) {break}
      timestamp += 24 * 3600 * 1000
    }
    return time
  } else if (countDays < 0) {
    countDays = -countDays
    month = month || 12
    let monthStr = String(month)
    if (monthStr.length === 1) { monthStr = "0" + monthStr }
    day = day || 31
    let dayStr = String(day)
    if (dayStr.length === 1) { dayStr = "0" + dayStr }
    // Starting moment, ms.
    let timestamp = +new Date(`${year}-${monthStr}-${dayStr}T00:01:00Z`)
    let time
    for (let i = 366; i >= 0; i--) {
      time = new Date(timestamp)
      if (time.getDay() === weekDay) {countedDays++}
      if (countedDays === countDays) {break}
      timestamp -= 24 * 3600 * 1000
    }
    return time
  }
}

// Relative time in milliseconds.
const relativeTime = {
  today: 0,
  tomorrow: 24 * 3600 * 1000,
  yesterday: -24 * 3600 * 1000,
  second: 1000,
  minute: 60 * 1000,
  hour: 3600 * 1000,
  day: 24 * 3600 * 1000,
  week: 7 * 24 * 3600 * 1000,
  month: 31 * 24 * 3600 * 1000,
  year: 365 * 24 * 3600 * 1000,
}

// Takes a Date, returns the date of the last day of the corresponding month.
// eg, 31.
function lastDayOfMonth(time) {
  let year = time.getUTCFullYear()
  let nextMonth = time.getUTCMonth() + 2
  if (nextMonth > 12) {
    year++
    nextMonth = 1
  }
  let nextMonthStr = String(nextMonth)
  if (nextMonthStr.length === 1) { nextMonthStr = '0' + nextMonthStr }
  let date = new Date(`${year}-${nextMonthStr}-01T00:00:00Z`)
  return (new Date(+date - 1000)).getUTCDate()
}
