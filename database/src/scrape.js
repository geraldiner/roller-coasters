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
  const rollerCoasters = []
  for (let i = 0; i < rollerCoasterLinks.length; i++) {
    let coaster = rollerCoasterLinks[i]
    const coasterURL = rootURL + coaster.link
    const html = await getRollerCoasterHtml(coasterURL)
    const $ = cheerio.load(html)
    const themePark = $('h2.topgrn').find('a').text().trim()
    const themeParkLink = $('h2.topgrn').find('a').attr('href')
    const $contentN = $('#contentN')
    const descHtml = $contentN[0].children[13]
    let desc = descHtml.name == 'p' ? descHtml.children[0].data : ''
    const tds = $('.rc_detail').find('td')
    const year = tds[0].children.length > 0 ? tds[0].children[0].data : ''
    const track = tds[1].children.length > 0 ? tds[1].children[0].data : ''
    const type = tds[2].children.length > 0 ? tds[2].children[0].data : ''
    const designer = tds[3].children.length > 0 ? tds[3].children[0].data : ''
    const rc_stats_lis = $('.rc_stats').find('li')
    let stats = []
    rc_stats_lis.each((index, element) => {
      const stat = element.children.length > 0 ? element.children[0].data : ''
      stats.push(stat)
    })
    const facts = []
    const $rc_stats = $('.rc_stats')
    const $rc_detail = $('.rc_detail')
    if ($rc_stats.length > 0) {
      const nublu = $rc_stats.next()
      const start = nublu.next()
      const firstText = start[0].next.data.trim()
      if (firstText) facts.push(firstText)
      let next = start.next()
      while (next.length > 0) {
        if (next[0].name == 'p' && next[0].children.length > 0) facts.push(next[0].children[0].data)
        next = next.next()
      }
    } else if ($rc_detail > 0) {
      const nublu = $rc_detail.next()
      const start = nublu.next()
      const firstText = start[0].next.data.trim()
      if (firstText) facts.push(firstText)
      let next = start.next()
      while (next.length > 0) {
        if (next[0].name == 'p' && next[0].children.length > 0) facts.push(next[0].children[0].data)
        next = next.next()
      }
    }
    const coasterObj = {
      name: coaster.name,
      themePark: themePark,
      themeParkLink: rootURL + themeParkLink,
      description: desc,
      link: coasterURL,
      year: year,
      trackType: track,
      rideType: type,
      designer: designer,
      stats: stats,
      facts: facts
    }
    rollerCoasters.push(coasterObj)
  }
  fs.writeFileSync('roller_coasters_data.json', JSON.stringify(rollerCoasters, null, 2), 'utf8')
}

async function getRollerCoasterHtml(coasterURL) {
  const { data: html } = await axios.get(coasterURL)
  return html
}

async function getRollerCoasterLinks() {
  let rollerCoasterLinks = []
  const URL = 'https://www.ultimaterollercoaster.com/coasters/browse/a-to-z'
  const { data: html } = await axios.get(URL)
  const $ = cheerio.load(html)
  $('.tpList').each((index, element) => {
    const $alphaList = $(element)
    const $lis = $alphaList.find('li')
    $lis.each((liIndex, liElement) => {
      const $li = $(liElement)
      const name = $li.find('a').text().trim()
      const link = $li.find('a').attr('href')
      const rollerCoasterLink = {
        name: name,
        link: link
      }
      rollerCoasterLinks.push(rollerCoasterLink)
    })
  })
  fs.writeFileSync('roller_coasters_links.json', JSON.stringify(rollerCoasterLinks, null, 2), 'utf8')
}

// getRollerCoasterLinks()
// getRollerCoasterInfo()