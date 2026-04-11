import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})

const page = await browser.newPage()

page.on('console', msg => {
  console.log('CONSOLE:', msg.type(), msg.text())
})

page.on('pageerror', err => {
  console.log('PAGE ERROR:', err.message)
  console.log('STACK:', err.stack)
})

try {
  await page.goto('http://localhost:5191', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await new Promise(r => setTimeout(r, 2000))
  console.log('Page loaded successfully')
  console.log('URL:', page.url())
  console.log('Title:', await page.title())
} catch (err) {
  console.log('Navigation error:', err.message)
}

await browser.close()