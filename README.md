Alumno: Pablo Vera Garcia


Configuración del Correo Electrónico para Notificaciones en tu Aplicación

Para que tu aplicación pueda enviar correos electrónicos de verificación de cuenta y notificaciones de cuenta baneada, necesitas configurar las credenciales de tu correo electrónico en un archivo .env. Estos pasos te guiarán para obtener una contraseña de aplicación desde Gmail, que usarás en este archivo:

PASO 1: Habilitar la Verificación en Dos Pasos en tu Cuenta de Gmail

    1) Inicia sesión en tu cuenta de Google.
    2) Dirígete a la configuración de seguridad de tu cuenta:
        -Accede a myaccount.google.com
        -Navega a la sección "Seguridad".
        -En "Iniciar sesión en Google", selecciona "Verificación en dos pasos" y sigue las instrucciones para configurarla.

PASO 2: Generar una Contraseña de Aplicación

    1) Vuelve a la sección "Seguridad" en tu cuenta de Google.
    2) En "Iniciar sesión en Google", selecciona "Contraseñas de aplicaciones". Es posible que te soliciten iniciar sesión nuevamente.
    3) En el menú desplegable "Seleccionar la aplicación", elige "Correo" y para "Seleccionar el dispositivo", elige "Otros (nombre personalizado)". Ingresa un nombre descriptivo, por ejemplo, "NodeMailer".
    4) Haz clic en "Generar". Se creará un token.
    5) Copia esta contraseña y úsala en tu archivo .env como se muestra a continuación:

archivo .env: 
    EMAIL_USER= prueba765@gmail.com
    EMAIL_PASS= eaanvnlfkgidofwq (esta clave me lo he inventado como ejemplo)