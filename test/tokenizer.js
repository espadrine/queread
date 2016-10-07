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

  tokens = tokenize('22, 000 .15', tokenMatchers)
  assert.equal(tokens.length, 1, 'Parse space-separated number')
  assert.equal(tokens[0].type, 'number', 'Number type')
  assert.equal(tokens[0].text, '22, 000 .15', 'Number text')
  assert.equal(tokens[0].tag, 'number', 'Number tag')
  assert.equal(tokens[0].data, 22000.15, 'Number data')
}

exports.run = run
