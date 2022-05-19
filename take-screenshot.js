const chromium = require('chrome-aws-lambda')
const dayjs = require('dayjs')
const aws = require('aws-sdk')
const nodemailer = require('nodemailer')

const targetUrl = 'https://luisavalmaggia.com/'
const date = dayjs().format('DD-MM-YY')
const fileName = `${date}.png`

const sendEmail = async (content) => {
  const ses = new aws.SES({
    apiVersion: '2010-12-01',
    region: 'us-east-1'
  })

  // create Nodemailer SES transporter
  const transporter = nodemailer.createTransport({
    SES: { ses, aws }
  })

  return transporter.sendMail({
    from: 'fzaffarana@gmail.com',
    to: ['czaffarana@yahoo.com.ar'],
    subject: `Screenshot - ${date}`,
    text: `Screenshot - ${date}`,
    attachments: [
      {
        filename: fileName,
        content
      }
    ]
  })
}

exports.handler = async () => {
  let browser = null

  try {
    // take screenshot
    console.log('taking screenshot...')
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    })

    const page = await browser.newPage()

    await page.goto(targetUrl)
    const content = await page.screenshot({ type: 'png', fullPage: true })

    // send email
    console.log('sending email...')
    await sendEmail(content)
  } catch (error) {
    console.error(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}
