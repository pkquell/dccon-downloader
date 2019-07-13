'use strict'

// Import modules
const fs = require('fs')
const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')
const qs = require('querystring')
const readline = require('readline')

const ProgressBar = require('./progress')

// Enable axios-cookiejar-support
axiosCookieJarSupport(axios)

// Create new cookiejar object, which is a container for various sessions / cookies
const cookieJar = new tough.CookieJar()

const url = 'https://dccon.dcinside.com/index/package_detail'

const getInput = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question('Insert id here: ', input => resolve(input))
  })
}

// Extract ci_c value from given cookie
const extractCookie = cookie => {
  /* A structure of the given cookie
   * 
   * ['PHPSESSID=str; path=/; domain=str',
   * 'ci_c=str; expires=str; path=/']
   *
   */

  const ci_cValue = cookie[1]
    .split(';')[0]
    .split('=')[1];

  return new Promise(resolve => resolve(ci_cValue))
}

// 
const requestImages = (response, id)=> {
  if(!fs.existsSync(`${id}/`)) fs.mkdirSync(id, '0755')

  const dataArray = response.data.detail
  const dataArrayLength = dataArray.length

  const progressBar = new ProgressBar(dataArrayLength)

  dataArray.forEach(obj => {
    const dest = `${__dirname}/${id}/${obj.idx}.${obj.ext}`
    const wStream = fs.createWriteStream(dest)

    wStream.on('open', () => {
      axios.get(`https://dcimg5.dcinside.com/dccon.php?no=${obj.path}`,
      {
        headers: {
          'Referer': 'https://dccon.dcinside.com/',
        },
        responseType:'stream',
      }).then(response => {
        const image = response.data
        image.pipe(wStream)
      })
    })
    wStream.on('finish', () => {
      wStream.close()

      progressBar.current += 1
      progressBar.update()
    })
    wStream.on('error', (err) => {
      fs.unlink(dest)
      throw err
    })
  })
}

(async () => {
  try{
    const getID = await getInput()
    const responseGet = await axios.get(url, {
      jar: cookieJar,
      withCredentials: true
    });
    const acquireCookie = await extractCookie(responseGet.headers['set-cookie']);
    const responsePost = await axios.post(url,
      qs.stringify({
        ci_t: acquireCookie,
        package_idx: getID,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
        jar: cookieJar,
        withCredentials: true,
      })
    const downloadImages = await requestImages(responsePost, getID)
  } catch(err) {
    throw err
  }
})()