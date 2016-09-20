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
    // TODO: lowercase, detect locations, numbers, etc.
    let words = query.trim().split(/\s+/)

    // Build weights if necessary.
    if (this.weightsNeedBuilding) { this.buildWeights() }

    let labelWeightSums = new Map()
    let walkedNodes = [this.root]
    let walkedLinks = []
    words.forEach(text => {
      walkedNodes.forEach(node => {
        if (node.has(text)) {
          let link = node.getLink(text)
          link.labelWeight.forEach((linkWeight, label) => {
            let weight = labelWeightSums.get(label) || 0
            labelWeightSums.set(label, weight + linkWeight)
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
    console.log('labelWeightSums', labelWeightSums)

    // Add parameters.
    // TODO: separate links to words and links to parameters.
    // Give priority to deeper nodes.
    let parameters = []
    walkedNodes.forEach(node => {
      node.tags.slice(1).forEach(tag => {
        // TODO: don't use node.text, use the corresponding matched value.
        parameters.push({ name: tag, text: node.text })
      })
    })

    return {
      label: maxLabel,
      probability: max,
      parameters: parameters,
    }
  },
}

// Position of a word in the tree.
// word is {text, tags}, or undefined if it is the beginning of the query.
// root is a Node at the root of the tree (ie, the beginning of the query).
function Node(brain, word, root) {
  this.brain = brain
  if (word) {
    this.text = word.text
    this.tags = word.tags
  } else {
    this.text = ''
    this.tags = []
  }
  this.root = root || this
  // Map from words to Links pointing to Nodes corresponding to those words.
  this.links = new Map()
}

Node.prototype = {
  // text: possible word to which we have a link.
  has: function(text) {
    return this.links.has(text)
  },
  getLink: function(text) {
    return this.links.get(text)
  },
  get: function(text) {
    let link = this.links.get(text)
    if (link) {
      return link.target
    }
  },
  // Get the node corresponding to a given word.
  // word: eg. {word, tags}
  getNode: function(word) {
    let text = word.text
    if (this.root.links.has(text)) {
      return this.root.links.get(text).target
    } else {
      this.root.links.set(text, new Link(this.brain,
        new Node(this.brain, word, this.root)))
      return this.root.links.get(text).target
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
    let text = word.tags[0] || word.text
    let link
    if (this.links.has(text)) {
      link = this.links.get(text)
    } else {
      // We do not have a link to this.
      link = new Link(this.brain, this.getNode(word))
      this.links.set(text, link)
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
