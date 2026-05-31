# Jeopardy Matematico

Juego web tipo Jeopardy con tablero editable, TeX para expresiones matematicas y buzzers remotos para celulares.

Incluye menu de inicio, pantalla de instrucciones, tablero principal, modal de pregunta con temporizador, marcador visible, Final Jeopardy y pantalla de premiacion con podio y confeti.

## Ejecutar

```powershell
& "C:\Users\Lenovo T14s\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

Luego abre:

- Anfitrion: http://localhost:3000
- Buzzer movil: http://localhost:3000/buzzer

Para celulares, usa el enlace de red local que aparece en la pantalla del anfitrion. El telefono y la computadora deben estar en la misma red Wi-Fi.

Si el puerto 3000 esta ocupado, puedes indicar otro:

```powershell
& "C:\Users\Lenovo T14s\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js 3001
```

## TeX

Puedes escribir TeX en preguntas y respuestas, por ejemplo:

```tex
$x^2+5x+6=0$
$$A=\frac{bh}{2}$$
```

El render matematico usa MathJax desde CDN. Si el navegador no tiene internet, la partida funciona y muestra el codigo TeX sin renderizar.

## Retroalimentacion

Cada pregunta tiene pista y explicacion. En el editor puedes modificar pregunta, respuesta, pista y explicacion; al marcar una respuesta como correcta o incorrecta se muestra una retroalimentacion breve y formativa.

## Publicacion

El proyecto se puede subir a GitHub como repositorio normal. Para jugar con buzzers remotos, el servidor `server.js` debe ejecutarse en un entorno que soporte Node.js y WebSockets, por ejemplo una computadora local en la misma red, Render, Railway, Fly.io o un VPS.

GitHub Pages solo publica archivos estaticos, por lo que puede mostrar la interfaz, pero no puede ejecutar el servidor de buzzers por si solo.

### Desplegar en Render

1. Entra a https://render.com y conecta tu cuenta de GitHub.
2. Crea un servicio nuevo con **New > Web Service**.
3. Selecciona el repositorio `DiegoAliZuniga/jeopardy-matematico-web`.
4. Usa esta configuracion:
   - **Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Publica el servicio y espera a que termine el despliegue.

Render generara una URL publica parecida a `https://jeopardy-matematico-web.onrender.com`. Esa URL sera la pantalla principal del anfitrion; los celulares deben entrar a la misma URL con `/buzzer` al final.

Ejemplo:

```text
https://jeopardy-matematico-web.onrender.com/buzzer
```
