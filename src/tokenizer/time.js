const numberTokenizers = require('./number.js')
const integer = numberTokenizers.integer
const number = numberTokenizers.number

exports.time =
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


