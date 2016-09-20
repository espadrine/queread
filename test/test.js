const fs = require('fs')
const path = require('path')
const Bot = require('../queread.js')
let datafile = fs.readFileSync(path.join(__dirname, './dataset'))
let dataset = Bot.parse(String(datafile))
let bot = new Bot(dataset)
let guess = bot.guess('Get me to Madrid.')
console.log(guess)
