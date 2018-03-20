//Not working!!

'use strict'

const fs = require('fs')
const archiver = require('archiver')
 
let _dir = Symbol()
let _archive = Symbol()

module.exports = class Archiver {
  constructor(dir) {
    this[_dir] = dir
    this[_archive] = archiver('zip', {
      zlib: {
        level: 9
      }
    })

    const _output = fs.createWriteStream(`${this[_dir]}/archive.zip`)

    _output.on('close', () => {
      console.log(`\nTotal ${this[_archive].pointer()} bytes`)
    })

    this[_archive].on('error', err => {
      throw err
    })

    this[_archive].pipe(_output)
  }

  append(readableStream) {
    if (typeof readableStream.read != 'function') {
      console.log('Valid')
    }
    this[_archive].append(readableStream)
  }

  finalize() {
    this[_archive].finalize()
  }
}