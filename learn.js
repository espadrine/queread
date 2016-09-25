const tokenize = require('./data/tokenize.js')

// dataset (optional): output from data/parser.js
function Brain(dataset) {
  // The root of the tree represents the start of the query.
  this.root = new Node(this)

  // Number of examples per label.
  this.numExamples = new Map()
  // Are weights built?
  this.weightsNeedBuilding = true
  this.links = []

  this.learn = this.learn.bind(this)
  if (dataset != null) {
    dataset.forEach(this.learn)
  }
}

Brain.prototype = {
  // Learn an example.
  // eg. {labels, text, words: [{text, tags}]}.
  learn: function(example) {
    if (example.labels == null || example.words == null) {
      throw new Error('We tried learning an invalid example: "' + example + '"')
    }
    this.root.add(example)
    example.labels.forEach(label => {
      if (this.numExamples.get(label)) {
        let count = this.numExamples.get(label)
        this.numExamples.set(label, count + 1)
      } else {
        this.numExamples.set(label, 1)
      }
    })
    this.weightsNeedBuilding = true
  },
  // Build link.labelWeight.
  buildWeights: function() {
    this.links.forEach(link => {
      link.labelCount.forEach((count, label) => {
        link.labelWeight.set(label, count / this.numExamples.get(label))
      })
    })
    this.weightsNeedBuilding = false
  },
  guess: function(query) {
    // List of {text, tag, type}.
    let words = tokenize(query.trim())

    // Build weights if necessary.
    if (this.weightsNeedBuilding) { this.buildWeights() }

    let labelWeightSums = new Map()
    let walkedNodes = [this.root]
    let walkedLinks = []
    // Map from label to map from parameter name to parameter value.
    let paramsPerLabel = new Map()
    words.forEach(word => {
      let isParam = (word.type !== 'word')
      let text = word.tag
      walkedNodes.forEach(node => {
        // Does that node have a link to this word (or parameter)?
        let nodeHasIt = false
        if (isParam) { nodeHasIt = node.hasParam(text)
        } else { nodeHasIt = node.has(text) }

        if (nodeHasIt) {
          let link
          if (isParam) {
            link = node.getParamLink(text)
          } else { link = node.getLink(text) }

          link.labelWeight.forEach((linkWeight, label) => {
            let weight = labelWeightSums.get(label) || 0
            labelWeightSums.set(label, weight + linkWeight)

            if (isParam) {
              // Create the map for the accessible labels.
              let params = paramsPerLabel.get(label) || Object.create(null)
              let tags = link.target.labelTags.get(label) || []
              if (tags.length > 0) {
                // Remove the first tag, which is simply the token type
                // (`text`).
                tags.slice(1).forEach(tag => params[tag] = word.text)
              } else {
                // Use the token type (`text`).
                params[text] = word.text
              }
              paramsPerLabel.set(label, params)
            }
          })
          walkedNodes.push(link.target)
          walkedLinks.push(link)
        }
      })
    })

    let labelWeightSum = 0
    labelWeightSums.forEach((sum, label) => labelWeightSum += sum)
    let max = 0
    let maxLabel = ''
    labelWeightSums.forEach((sum, label) => {
      let labelProbability = sum / labelWeightSum
      labelWeightSums.set(label, labelProbability)
      if (max < labelProbability) {
        max = labelProbability
        maxLabel = label
      }
    })

    return {
      label: maxLabel,
      probability: max,
      parameters: paramsPerLabel.get(maxLabel) || {},
    }
  },
}

// Position of a word in the tree.
// `word` is {text, tags}, or undefined if it is the beginning of the query.
// `labels` is a list of strings corresponding to the labels of the example
//   leading to the creation of this node.
// `root` is a Node at the root of the tree (ie, the beginning of the query).
function Node(brain, word, labels, root) {
  this.brain = brain
  // Map from label to list of tags.
  this.labelTags = new Map()
  if (word) {
    this.text = word.text
    if (labels) {
      labels.forEach(label => this.labelTags.set(label, word.tags))
    }
  } else {
    this.text = ''
  }
  this.root = root || this
  // Map from words to Links pointing to Nodes corresponding to those words.
  this.links = new Map()
  // Map from parameters to Links pointing to corresponding Nodes.
  this.paramLinks = new Map()
}

Node.prototype = {
  // text: possible word to which we have a link.
  has: function(text) { return this.links.has(text) },
  hasParam: function(text) { return this.paramLinks.has(text) },
  getLink: function(text) { return this.links.get(text) },
  getParamLink: function(text) { return this.paramLinks.get(text) },
  get: function(text) {
    let link = this.links.get(text)
    if (link) {
      return link.target
    }
  },
  getParam: function(text) {
    let link = this.paramLinks.get(text)
    if (link) {
      return link.target
    }
  },
  // Get the node corresponding to a given word.
  // word: eg. {text, tags}
  getNode: function(word, labels) {
    let links = this.root.links
    let text = word.text
    // If the word has tags, it is a parameter.
    if (word.tags.length > 0) {
      links = this.root.paramLinks
      text = word.tags[0]
    }
    if (links.has(text)) {
      // That word already exists.
      // Use it, and complement it with the word's tags.
      let node = links.get(text).target
      labels.forEach(label => {
        if (!node.labelTags.has(label)) {
          node.labelTags.set(label, [])
        }
        let tags = node.labelTags.get(label)
        word.tags.forEach(tag => {
          if (tags.indexOf(tag) === -1) {
            tags.push(tag)
          }
        })
      })
      return node
    } else {
      links.set(text, new Link(this.brain,
        new Node(this.brain, word, labels, this.root)))
      return links.get(text).target
    }
  },
  add: function(example) {
    let labels = example.labels
    let walkedNodes = [this]
    example.words.forEach(word => {
      walkedNodes.forEach(node => {
        let newNode = node.addWord(word, labels)
        walkedNodes.push(newNode)
      })
    })
  },
  // eg. {word, tags}
  // Returns the corresponding node.
  addWord: function(word, labels) {
    let links = this.links
    let text = word.text
    // If the word has tags, it is a parameter.
    if (word.tags.length > 0) {
      links = this.paramLinks
      text = word.tags[0]
    }
    let link
    if (links.has(text)) {
      link = links.get(text)
    } else {
      // We do not have a link to this.
      link = new Link(this.brain, this.getNode(word, labels))
      links.set(text, link)
    }
    labels.forEach(label => link.walkedBy(label))
    return link.target
  }
}

// target: a Node.
function Link(brain, target) {
  this.brain = brain
  this.brain.links.push(this)
  this.target = target
  // Number of examples that walk through this link, given the example's label.
  this.labelCount = new Map()
  // Same as above, normalized by the number of examples for a label.
  // Populated by Brain.prototype.buildWeights().
  this.labelWeight = new Map()
}

Link.prototype = {
  walkedBy: function(label) {
    if (this.labelCount.get(label)) {
      let count = this.labelCount.get(label)
      this.labelCount.set(label, count + 1)
    } else {
      this.labelCount.set(label, 1)
    }
  }
}

module.exports = Brain
