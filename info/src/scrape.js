const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')

async function getRollerCoasterInfo() {
  let rollerCoasterLinks;
  try {
    const data = fs.readFileSync('info/src/roller_coasters_links.json', 'utf8')
    rollerCoasterLinks = JSON.parse(data);
  } catch (error) {
    console.log(`Error reading file from disk: ${err}`);

  }
  const rootURL = 'https://www.ultimaterollercoaster.com/'
  for (let i = 0; i < 3; i++) {
    const coaster = rollerCoasterLinks[i]
    const coasterURL = rootURL + coaster.link
    try {
      const html = await getSingleCoasterInfo(coasterURL)
      const $ = cheerio.load(html)
      const descHtml = $('#contentN')[0].children[13]
      let desc = descHtml.name == 'p' ? descHtml.children[0].data : ''
      const tds = $('.rc_detail').find('td')
      const year = tds[0].children[0].data
      const track = tds[1].children[0].data
      const type = tds[2].children[0].data
      const designer = tds[3].children[0].data
      // console.log(`${coaster.name} at ${coaster.themePark} created by ${designer} in ${year} is a ${type} coaster with ${track} track.`)
      const rc_stats = $('.rc_stats').find('li')
      let stats = []
      rc_stats.each((index, element) => {
        const stat = element.children[0].data
        stats.push(stat)
      })
    } catch (error) {
      console.log(`Error on ${coaster.name}: ${error}`)
    }
  }
}

async function getSingleCoasterInfo(coasterURL) {
  const { data: html } = await axios.get(coasterURL)
  return html
}

async function getRollerCoasterLinks() {
  const URL = 'https://www.ultimaterollercoaster.com/coasters/browse/a-to-z'
  const { data: html } = await axios.get(URL)
  const $ = cheerio.load(html)
  $('.tpList').each((index, element) => {
    const $alphaList = $(element)
    const $lis = $alphaList.find('li')
    $lis.each((liIndex, liElement) => {
      const $li = $(liElement)
      const $children = $li.children()
      const name = $li.find('a').text().trim()
      const link = $li.find('a').attr('href')
      const themePark = $li.text().trim()
      const rollerCoasterLink = {
        name: name,
        link: link,
        themePark: themePark
      }
      rollerCoasterLinks.push(rollerCoasterLink)
    })
  })
  fs.writeFileSync('roller_coasters_links.json', JSON.stringify(rollerCoasterLinks, null, 2), 'utf8')
}

getRollerCoasterInfo()