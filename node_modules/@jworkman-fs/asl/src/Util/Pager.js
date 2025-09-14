const { 
  PagerLimitExceededError,
  PagerOutOfRangeError
} = require("../Exception/pager.js")

class Pager {
  constructor(data, page = 1, limit = 10) {
    // Make our args safe by casting them
    page  = ('undefined' === typeof page  || isNaN(page) ) ? 1  : Number(page)
    limit = ('undefined' === typeof limit || isNaN(limit)) ? 10 : Number(limit)
    // Make sure data is at least an array
    this.data    = data||[] 

    // Make sure page is at least set to 0 as a good default 
    this.page    = page

    // Set the page index to a zero based index (page - 1)
    this.index   = (this.page - 1 < 0) ? 0 : this.page - 1

    // Make sure we have a limit set to 10 as a good default
    this.limit   = limit 

    // Grab the total number of results
    this.total   = this.data.length 

    // Calculate the last safe offset
    this.maxSafe = Math.max((this.total - 1), 0)

    // Calculate the total number of remaining results after pagination is applied
    this.left    = this.total % this.limit

    // Calculate the total number of pages we have available to us
    this.pages   = Math.ceil(this.total / this.limit)

    // Now lets validate everything in the context
    this.validateContext()

  }
  validateContext() {
    // If the user is requesting a higher limit larger than 20
    if (this.limit > 20) {
      throw new PagerLimitExceededError("The limit per page cannot exceed 20.")
    }

    // If the requested page is outside of our valid range of results 
    if (this.page < 1 || this.page > this.pages) {
      throw new PagerOutOfRangeError(`Requested page ${this.page} is out of range. Any value of 1 through ${this.pages} is allowed.`)
    }
  }
  // Grabs the next valid page number
  next() {
    return Math.min(this.page + 1, this.pages)
  }
  // Translates the requested page to a valid offset value
  offset() {
    const requestedOffset = this.index * this.limit
    return Math.min(this.maxSafe, requestedOffset)
  }
  // Grabs the previous valid page number
  prev() {
    return Math.max(this.page - 1, 1)
  }
  // Grabs the total number of pages (or sets of results)
  pages() {
    return this.pages
  }
  safeRange(num) {
    return Math.max(Math.min(this.total, num), 0)
  }
  safeOffset(num) {
    return Math.min(this.total, num) 
  }
  results() {
    // Perform the splicing operation to get an accurate page context array/set
    const start = this.offset()
    const end = this.safeOffset(this.offset() + this.limit)
    return this.data.slice(start, end)
  }
}

module.exports = Pager
