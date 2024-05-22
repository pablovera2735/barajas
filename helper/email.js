const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pablosky1307@gmail.com',
    pass: 'eaanvnlspdlqjkwq'
  }
});


module.exports = transporter;