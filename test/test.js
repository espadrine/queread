const fs = require('fs')
const path = require('path')
const assert = require('assert')
const Bot = require('../queread.js')
let datafile = fs.readFileSync(path.join(__dirname, './dataset'))
let dataset = Bot.parse(String(datafile))
let bot = new Bot(dataset)

let guess = bot.guess('I\'ll take number 2.')
assert.equal(guess.label, 'select',
  'Guess a selection')
assert.equal(guess.parameters.selection, 2,
  'Guess the number of the selection')

guess = bot.guess('Get me to Madrid.')
assert.equal(guess.label, 'search',
  'Guess a search')
