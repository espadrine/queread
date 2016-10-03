// Raw string dataset.
// Returns a list of {labels, text, words: [{text, tags}]}.
function parse(dataset) {
  let lines = dataset.split('\n')
  return lines.map(parseExample).filter(i => i != null)
}

// Single string example
// eg. "search: Can you get me /a train/ [vehicle] to Brighton [location] [destination]?"
function parseExample(example) {
  let labelIndex = example.indexOf(':')
  if (labelIndex < 0) { return }
  let labelsText = example.slice(0, labelIndex)
  let labels = labelsText.trim().split(/\s+/)
  let text = example.slice(labelIndex + 1)
  // ['/get/', 'train [vehicle]', '/to/', 'Brighton [location] [departure]']
  let rawWords = text.match(/\/[\w'":\-\s]+\/(\s\[\w+\])*|[\w'":-]+(\s\[\w+\])+/g)
  let words = rawWords.map(parseWord)
  return {
    labels: labels,
    text: text,
    words: words,
  }
}

// eg. "/get/ [verb]"
function parseWord(word) {
  let text, rest
  if (word[0] === '/') {
    // The word is delimited by slashes, eg. "/get/".
    let index = word.indexOf('/', 1)
    text = word.slice(1, index)
    rest = word.slice(index + 2)
  } else {
    // The word is delimited by its characters, eg. "get [verb]".
    let index = word.indexOf(' ')
    text = word.slice(0, index)
    rest = word.slice(index + 1)
  }
  let tags = rest.trim().split(/\s+/).map(tag => tag.slice(1, -1))
    .filter(tag => tag !== '')
  return {
    text: text.toLowerCase(),
    tags: tags,
  }
}

module.exports = parse
