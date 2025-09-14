const {
  DuplicateContactError,
  ContactNotFoundError,
  InvalidContactSchemaError,
  InvalidOperatorError,
  NoContactsFoundError,
  InvalidContactFieldError
} = require("../Exception/index.js")

let contacts = require("../Data/contacts.js")

const schemaFields = ['fname', 'lname', 'email', 'phone', 'birthday']

function validateEmail(email) 
{
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function validatePhone(phone) 
{
  const regex = /^\d{3}-\d{3}-\d{4}$/; // Basic international phone number format check
  return regex.test(phone)
}

function compare(operator, value1, value2) {
  switch (operator) {
    case 'eq':
    case '===':
      return value1 === value2;
    case 'neq':
    case '!==':
      return value1 !== value2;
    case 'lt':
    case '<':
      return value1 < value2;
    case 'lte':
    case '<=':
      return value1 <= value2;
    case 'gt':
    case '>':
      return value1 > value2;
    case 'gte':
    case '>=':
      return value1 >= value2;
    default:
      throw new InvalidOperatorError(`"${operator}" is not a valid filter operator.`)
  }
}

function validateContactData(contact, validateIdentifier = false) {
  const requiredFields = ['fname', 'lname', 'email', 'phone']

  // Add the "id" field if we have this argument set to true
  if (true === validateIdentifier) {
    requiredFields.unshift(`id`)
  }
  
  // Check for missing fields
  requiredFields.forEach(field => {
    if (`undefined` === typeof contact[field]) {
      throw new InvalidContactSchemaError(`Field ${field} is missing.`)
    }
  })

  // Validate email
  if (!validateEmail(contact.email)) {
    throw new InvalidContactFieldError("Invalid email format.")
  }

  // Validate phone
  if (!validatePhone(contact.phone)) {
    throw new InvalidContactFieldError("Invalid phone format.")
  }

  // Validate optional id (if present)
  if ('id' in contact && typeof contact.id !== 'number') {
    throw new InvalidContactFieldError("Invalid id format.")
  }
}

class Model {
  create(contact) {
    if (contacts.some(c => c.email === contact.email)) {
        throw new DuplicateContactError("A contact with the same email already exists.")
    }

    // Validate contact fields and schema here and throw exceptions as necessary
    validateContactData(contact)

    let maxId = contacts.reduce((max, obj) => Number(obj.id) > max ? Number(obj.id) : max, Number(contacts[0].id))
    maxId += 1

    const newContact = { id: maxId, ...contact }
    contacts.push(newContact)
    return newContact
  }
  show(id) {
    const contact = contacts.find(contact => contact.id === Number(id))
    if (!contact) {
        throw new ContactNotFoundError(`Contact with ID ${id} not found.`)
    }
    return contact
  }
  update(id, updatedContact) {
    id = Number(id)
    const contactIndex = contacts.findIndex(contact => contact.id === id)
    if (contactIndex === -1) {
      throw new ContactNotFoundError(`Contact with ID ${id} not found.`)
    }
    // Validate updated contact fields here and throw exceptions as necessary
    validateContactData({ id, ...updatedContact })

    contacts[contactIndex] = { ...contacts[contactIndex], id, ...updatedContact }
    return contacts[contactIndex]
  }
  remove(id) {
    const contactIndex = contacts.findIndex(contact => contact.id === Number(id))
    if (contactIndex === -1) {
        throw new ContactNotFoundError(`Contact with ID ${id} not found.`)
    }
    contacts.splice(contactIndex, 1)
    return true
  }
  index() {
    return contacts
  }
}

const ContactModel = new Model()


function sortContacts(data = [], by = 'id', direction = 'asc') 
{
  if (!['id', ...schemaFields].includes(by)) {
    throw new InvalidContactSchemaError(`"${by}" is not a valid field enum value to sort by.`)
  }
  // If we are sorting by "id" then just reverse the array
  if (by === "id") {
    return (direction === "asc") ? data : data.reverse()
  } else if (by === "birthday") {
    return data.sort((a, b) => {
      let valueA = a[by].replace(/\D/g,'') * 1
      let valueB = b[by].replace(/\D/g,'') * 1
      if (direction === 'desc') {
        // For ascending order
        if (valueA > valueB) return -1
        if (valueA < valueB) return 1
        return 0
      }
      // For descending order
      if (valueA < valueB) return -1
      if (valueA > valueB) return 1
      return 0
    }); 
  } else {
    return data.sort((a, b) => {
      let valueA = a[by]
      let valueB = b[by]
      if (direction === 'desc') {
        // For descending order
        if (valueA < valueB) return -1
        if (valueA > valueB) return 1
        return 0
      }
        // For ascending order
      if (valueA > valueB) return -1
      if (valueA < valueB) return 1
      return 0
    })
  }
}

function filterContacts(by = 'id', operator = 'gte', value = 1, data = false)
{
  // If our data is set to false then get all from our model 
  data = (data === false) ? ContactModel.index() : data

  // Validate the by field against our schema
  if (!['id', ...schemaFields].includes(by)) 
    throw new InvalidContactSchemaError(`"${by}" is not a valid field enum value to filter by.`)

  // If we are attempting to filter by "id" then we need to cast our value to number
  value = (by === 'id') ? value * 1 : value

  // Return the filter results
  const results = data.filter((contact) => compare(operator, contact[by], value))

  // Throw an exception if there are no results
  if (results.length === 0) {
    throw new NoContactsFoundError('Sorry! It looks like there are no contacts matching your filtering criteria. Please change your filtering criteria and try again.')
  }

  return results
}

module.exports = { sortContacts, filterContacts, ContactModel, contacts, validateContactData }
