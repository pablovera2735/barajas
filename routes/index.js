const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const transporter = require('../helper/email');
const crypto = require('crypto');

let verificationTokens = {};

router.get('/', function(req, res) {
  res.render('registrar', { error: '' });
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
      if (verificationTokens[correo]) {
        return res.render('login', { error: 'Debe verificar su cuenta antes de iniciar sesión.' });
      }

      if (existingUser.bannedTime && new Date(existingUser.bannedTime) > new Date()) {
        const banTimeLeft = Math.round((new Date(existingUser.bannedTime) - new Date()) / 1000 / 60);
        return res.render('login', { error: `Su cuenta está bloqueada. Inténtelo de nuevo en ${banTimeLeft} minutos.` });
      }

      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (passwordMatch) {
        req.session.userId = existingUser.id;
        await existingUser.update({ lastLogin: new Date(), nTries: 0 });
        res.redirect('/barajas');
      } else {
        let newTries = existingUser.nTries + 1;
        let bannedUntil = null;
        if (newTries >= 3) {
          bannedUntil = new Date(new Date().getTime() + 5 * 60 * 1000);
          newTries = 0;

          let mailOptions = {
            from: process.env.EMAIL_USER,
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
      res.render('login', { error: 'No existe una cuenta con este correo electrónico.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

router.post('/', async function(req, res) {
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

    const token = crypto.randomBytes(32).toString('hex');
    const verificationLink = `${req.protocol}://${req.get('host')}/verify?token=${token}&email=${correo}`;

    verificationTokens[correo] = token;

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Verificación de Cuenta',
      text: `Por favor, verifique su cuenta haciendo clic en el siguiente enlace: ${verificationLink}`,
      html: `<b>Por favor, verifique su cuenta haciendo clic en el siguiente enlace:</b> <a href="${verificationLink}">${verificationLink}</a>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.render('login', { error: 'Cuenta creada. Verifique su correo electrónico.' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

router.get('/verify', async function(req, res) {
  const { token, email } = req.query;

  try {
    const user = await User.findOne({ where: { id: email } });
    if (user) {
      if (verificationTokens[email] === token) {
        delete verificationTokens[email];
        await user.update({ isVerified: true });
        res.render('login', { error: 'Cuenta verificada. Por favor, inicie sesión.' });
      } else {
        res.status(400).send('Token de verificación inválido o expirado.');
      }
    } else {
      res.status(400).send('Token de verificación inválido o expirado.');
    }
  } catch (error) {
    console.error('Error verifying account:', error);
    res.status(500).send('Error verifying account: ' + error.message);
  }
});

module.exports = router;