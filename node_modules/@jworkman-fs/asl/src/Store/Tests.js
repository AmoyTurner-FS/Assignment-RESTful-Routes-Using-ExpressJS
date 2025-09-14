const os = require('os')
const fs = require('fs')
const path = require('path')
const slugify = require('slugify')

// Constructing the path to the file in the user's home directory
const homeDirectory = os.homedir()
const storagePath = path.join(homeDirectory, '.asl', 'testing')

const didTestPass = (label) => {
  const slug = slugify(label)
  return JSON.parse(fs.readFileSync(`${storagePath}/${slug}.json`))
}

const didTestFail = (label) => {
  return !didTestPass(label)
}

const onTestPass = (label) => {
  const slug = slugify(label)
  return fs.writeFileSync(`${storagePath}/${slug}.json`, JSON.stringify(true))
}

const onTestFail = (label) => {
  const slug = slugify(label)
  return fs.writeFile(`${storagePath}/${slug}.json`, JSON.stringify(false))
}

module.exports = { onTestPass, onTestFail, didTestPass, didTestFail }
