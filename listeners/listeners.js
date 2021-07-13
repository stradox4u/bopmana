const { EventEmitter } = require('events')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sender = process.env.SENDGRID_SENDER_EMAIL

const eventEmitter = new EventEmitter()

eventEmitter.on('sendVerificationEmail', async ({
  username,
  verifyUrl,
  recipient
}) => {
  const msg = {
    to: recipient,
    from: sender,
    templateId: 'd-24ed52aaa6244b5e95c652e110c7da6f',
    dynamicTemplateData: {
      subject: 'Verify your email',
      username: username,
      verifyLink: verifyUrl
    }
  }
  try {
    const sentMail = await sgMail.send(msg)
    if (sentMail) {
      console.log('Email sent')
    }
  } catch (err) {
    console.error(err)
  }
})

eventEmitter.on('resetPassword', async ({ username, resetUrl, recipient }) => {
  const msg = {
    to: recipient,
    from: sender,
    templateId: 'd-3276441457e54197a224e31ee2d4539a',
    dynamicTemplateData: {
      subject: 'Password reset instructions',
      username: username,
      resetLink: resetUrl
    }
  }
  try {
    const sentMail = await sgMail.send(msg)
    if (sentMail) {
      console.log('Email sent')
    }
  } catch (err) {
    console.error(err)
  }
})

eventEmitter.on('passwordUpdated', async ({ username, recipient }) => {
  const msg = {
    to: recipient,
    from: sender,
    templateId: 'd-18ab0928c055456a986d6fd65a6ac437',
    dynamicTemplateData: {
      subject: 'Password successfully reset',
      username: username,
    }
  }
  try {
    const sentMail = await sgMail.send(msg)
    if (sentMail) {
      console.log('Email sent')
    }
  } catch (err) {
    console.error(err)
  }
})

eventEmitter.on('inviteCreated', async ({
  username,
  businessname,
  recipient,
  inviteUrl
}) => {
  const msg = {
    to: recipient,
    from: sender,
    templateId: 'd-8186f30811b4430490021547697802d2',
    dynamicTemplateData: {
      subject: `Invitation from ${businessname}`,
      username: username,
      businessname: businessname,
      inviteLink: inviteUrl
    }
  }
  try {
    const sentMail = await sgMail.send(msg)
    if (sentMail) {
      console.log('Invitation Email Sent')
    }
  } catch (err) {
    console.log(err)
  }
})

eventEmitter.on('goodsReturned', async ({
  businessname,
  recipient,
  creator,
  returnLink
}) => {
  const msg = {
    to: recipient,
    from: sender,
    templateId: 'd-45ccda29cd9a4654bae8c5394c1d4c57',
    dynamicTemplateData: {
      subject: 'Goods returned',
      businessname: businessname,
      creator: creator,
      returnLink: returnLink
    }
  }
  try {
    const sentMail = await sgMail.send(msg)
    if (sentMail) {
      console.log('Faulty Sale Report Email Sent')
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = eventEmitter