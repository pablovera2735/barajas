var express = require('express');
var router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const transporter = require('../helper/email');

router.get('/', function(req, res) {
  res.render('registrar');
});

router.get('/login', function(req, res) {
  res.render('login', { error: '' });
});

router.post('/login', async function(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.render('login', { error: 'Correo y contraseña son requeridos.' });
  }

  try {
    const existingUser = await User.findOne({ where: { id: correo } });
    if (existingUser) {
      if (existingUser.bannedTime && new Date(existingUser.bannedTime) > new Date()) {
        const banTimeLeft = Math.round((new Date(existingUser.bannedTime) - new Date()) / 1000 / 60);
        return res.render('login', { error: `Su cuenta está bloqueada. Inténtelo de nuevo en ${banTimeLeft} minutos.` });
      }

      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (passwordMatch) {
        await existingUser.update({ lastLogin: new Date(), nTries: 0 });
        res.redirect('/barajas');
      } else {
        let newTries = existingUser.nTries + 1;
        let bannedUntil = null;
        if (newTries >= 3) {
          bannedUntil = new Date(new Date().getTime() + 5 * 60 * 1000);
          newTries = 0;

          let mailOptions = {
            from: 'al.pablo.vera.garcia@iesportada.org',
            to: existingUser.id,
            subject: 'Notificación de Cuenta Bloqueada',
            text: 'Su cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.',
            html: '<b>Su cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.</b>'
          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        }

        await existingUser.update({ nTries: newTries, bannedTime: bannedUntil });
        res.render('login', { error: 'Contraseña incorrecta. Inténtelo de nuevo.' });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        id: correo,
        password: hashedPassword
      });
      res.render('login', { error: 'Cuenta creada. Por favor, inicie sesión.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

router.post('/registrar', async function(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.render('registrar', { error: 'Correo y contraseña son requeridos.' });
  }

  try {
    const existingUser = await User.findOne({ where: { id: correo } });
    if (existingUser) {
      return res.render('registrar', { error: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      id: correo,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

module.exports = router;