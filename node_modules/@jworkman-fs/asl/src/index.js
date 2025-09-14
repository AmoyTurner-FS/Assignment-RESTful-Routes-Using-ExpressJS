const { sortContacts, validateContactData, filterContacts, contacts, ContactModel } = require( "./Model/index.js" )
const Pager = require("./Util/Pager.js")
const allErrors = require('./Exception/index.js')
const testingErrors = require('./Exception/testing.js')
module.exports = {
  ...allErrors,
  ...testingErrors,
  contacts,
  ContactModel,
  Pager,
  sortContacts,
  filterContacts,
  validateContactData
}
