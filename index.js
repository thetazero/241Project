const cheerio = require('cheerio')
const axios = require('axios')
const { URL } = require('url')
const fs = require('fs')

let startUrl = 'https://cmu.edu'

let data = {}

const timer = setTimeout(() => { }, 999999);

async function scrape(url, map, i = 0) {
  if (i >= 30) return
  if (url in map) {
    console.log(`already scraped ${url}`)
    return
  }
  map[url] = {}
  let data = await axios.get(url)
  $ = cheerio.load(data.data)
  $('a').each((i, link) => {
    link = $(link).attr('href')
    // console.log(link)
    if (link != null) {
      console.log(link, url)
      link = (new URL(link, url))
      // console.log(link)
      if (link.origin != 'https://www.cmu.edu' && link.origin != 'http://www.cmu.edu') return
      link = link.origin + link.pathname
      // console.log(link)
      map[url][link] = true
    }
  });
  for (let key in map[url]) {
    try {
      await scrape(key, map, ++i)
    } catch (e) {
      console.log(`could not scrape ${key}`)
    }
  }
  return 3
}

(async () => {
  console.log(await scrape(startUrl, data))
  console.log(data)
  let newData = {}
  for (let from in data) {
    newData[from] = []
    for (let to in data[from]) {
      newData[from].push(to)
    }
  }
  fs.writeFileSync('links.json', JSON.stringify(newData))
  clearInterval(timer)
})()

