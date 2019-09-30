'use strict'

const _private = {
  updateConsole() {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write(this.progressBar)
  },

  quitConsole() {
    /*process.stdout.write('\nPress Any key to exit...')
    process.stdin.on('data', (key) => {
      if(key) process.exit(0)
    })*/
    process.stdout.write('\n')
    process.exit(0)
  },
}

module.exports = class ProgressBar {
  constructor(total) {
    this.total = total
    this.size = 20
    this.current = 0
    this.progressBar = '□'.repeat(this.size)
  }

  update () {
    const preciseProgressRate = this.current / this.total
    const progressRate = Math.round(preciseProgressRate * this.size)

    this.progressBar = `${Math.round(preciseProgressRate * 100)}% ${'■'.repeat(progressRate)}${'□'.repeat(this.size - progressRate)}`

    _private.updateConsole.call(this)

    if(preciseProgressRate >= 1) {
      _private.quitConsole()
    }
  }
}