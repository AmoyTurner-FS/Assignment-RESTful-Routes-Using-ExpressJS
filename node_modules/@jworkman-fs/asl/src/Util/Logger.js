const chalk = require('chalk')

const Logger = {
  info: (message) => console.log(chalk.cyan.italic(`🔍 [@jworkman-fs/asl]: ${message}`)),
  success: (message) => console.log(chalk.green.bold(`🔍 [@jworkman-fs/asl]: ${message}`)),
  warn: (message) => console.warn(chalk.yellow.dim(`⚠️ [@jworkman-fs/asl]: ${message}`)),
  error: (message) => console.error(chalk.red.bold(`❌ [@jworkman-fs/asl]: ${message}`))
}

module.exports = Logger
