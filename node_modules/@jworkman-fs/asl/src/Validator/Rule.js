const { 
  InvalidContactFieldError,
  BlankContactFieldError
} = require("../Exception/index.js")
const Logger = require("../Util/Logger.js")

class ValidatorRule {
    constructor(regex, name = 'any', required = false) {
        this.regex = regex
        this.required = required
        this.name = name
    }

    validate(value) {
        if (this.required && (!value || !value.trim())) {
            Logger.error(`❌ - Contact details failed validation for field: ${this.name}`)
            throw new BlankContactFieldError("A required field is blank.")
        }
        if (value && !this.regex.test(value)) {
            Logger.error(`❌ - Contact details failed validation for field: ${this.name}`)
            throw new InvalidContactFieldError("Field does not match the required pattern.")
        }
        return true
    }
}

module.exports = ValidatorRule
