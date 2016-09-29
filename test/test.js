const fs = require('fs')
const path = require('path')
const assert = require('assert')
const Bot = require('../queread.js')
let datafile = fs.readFileSync(path.join(__dirname, './dataset'))
let dataset = Bot.parse(String(datafile))
let bot = new Bot(dataset)

// Added tokenizers.
bot.addParameter(function origin(tokens) {
  let previousToken = tokens.last()
  if (previousToken !== undefined && previousToken.type === 'word'
      && previousToken.tag === 'from') {
    let match = /^\w+/.exec(tokens.rest())
    if (match !== null) {
      return { tag: 'origin', length: match[0].length, data: match[0] }
    }
  }
})
bot.addParameter(function destination(tokens) {
  let previousToken = tokens.last()
  if (previousToken !== undefined && previousToken.type === 'word'
      && previousToken.tag === 'to') {
    let match = /^\w+/.exec(tokens.rest())
    if (match !== null) {
      return { tag: 'destination', length: match[0].length, data: match[0] }
    }
  }
})
bot.addParameter(function destination(tokens) {
  let match = /^(car|bus|metro|train|plane|boat)\b/.exec(tokens.rest())
  if (match !== null) {
    return { tag: 'vehicle', length: match[0].length, data: match[0] }
  }
})
bot.addParameter(function gender(tokens) {
  let match = /^(boy|girl|man|woman|genderqueer|agender)\b/.exec(tokens.rest())
  if (match !== null) {
    let gender
    if (match[0] === 'boy' || match[0] === 'man') { gender = 'male'
    } else if (match[0] === 'girl' || match[0] === 'woman') { gender = 'female'
    } else { gender = match[0] }
    return { tag: 'vehicle', length: match[0].length, data: gender }
  }
})

let guess = bot.guess("I'll take number 2.")
assert.equal(guess.label, 'select',
  'Guess a selection')
assert.equal(guess.parameters.selection, 2,
  'Guess the number of the selection')

guess = bot.guess("Get me to Madrid.")
assert.equal(guess.label, 'search',
  'Guess a search')
assert.equal(guess.parameters.destination, 'Madrid',
  'Guess the destination of the search')
