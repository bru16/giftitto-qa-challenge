# QA Technical Challenge — Giftitto

## 1. Estrategia & Enfoque de Pruebas
Se realizó una sesión de testing exploratorio y funcional sobre la plataforma web [Giftitto QA](https://giftitto-qa.vercel.app/).

- **Ámbito de prueba:** Flujos de catálogo, autenticación, control de acceso, proceso transaccional de compra, gestión de sesión y consistencia de datos en la cuenta de usuario.
- **Criterio de priorización:** Se utilizó una matriz basada en la **Severidad** y la **Prioridad de Negocio**

---

## 2. Matriz de Hallazgos y Priorización

| ID | Título del Bug / Hallazgo | Categoría | Severidad | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Acceso no autenticado a datos sensibles en `/cuenta` | Seguridad | Crítica | P1 |
| **BUG-01** | Las giftcards compradas no se persisten en los perfiles de los usuarios. | Datos | Crítica | P1 |
| **BUG-02** | Pérdida de ítems en compras múltiples ($N > 1$) | Transaccional | Alta | P1 |
| **BUG-03** | Falta de actualización del estado de sesión post-login | Auth / UX | Alta | P1 |
| **BUG-04** | Doble renderizado y petición redundante al cargar Login | Auth / UX | Media | P2 |
| **BUG-05** | Omisión de feedback visual en credenciales inválidas | Auth / UX | Media | P2 |
| **BUG-06** | Inconsistencia entre el inventario visible y el límite máximo de selección | Datos / UX | Baja | P3 |
| **BUG-07** | Estado del botón "Compartir" muta a "Copiado" tras interacción | UI / UX | Baja | P3 |
| **BUG-08** | Acción del botón "Favorito" inoperativa | UI / UX | Baja | P3 |
| **ENH-01** | Redirección directa e intencionalidad de compra en la Home | UX / Mejora | - | P4 |
| **ENH-02** | Inconsistencias ortográficas (tildes) y estados Hover en Home | Visual | - | P4 |

---

## 3. Detalle de Bugs y Vulnerabilidades

### [SEC-01] Acceso no autenticado a información sensible (Broken Access Control)

- **Severidad:** Crítica
- **Prioridad:** P1
- **Justificación:** Vulnerabilidad OWASP (A01:2021-Broken Access Control). Permite a cualquier usuario no autenticado visualizar datos personales y giftcards de un usuario registrado con solo navegar directamente a la URL, comprometiendo la privacidad y seguridad de la plataforma.
- **URL:** `https://giftitto-qa.vercel.app/cuenta`

#### Pasos para reproducir:
1. Abrir una ventana de navegador en modo incógnito (sin sesión iniciada).
2. Ingresar directamente a la URL: `https://giftitto-qa.vercel.app/cuenta`.
3. Observar el contenido de la página.

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** El sistema debe aplicar un middleware/guardia de navegación, denegar el acceso y redirigir al usuario a `/login`.
- **Resultado Real:** La vista `/cuenta` renderiza la información completa de un usuario (foto de perfil, correo electrónico, nombre y giftcards asociadas).

#### Criterios de Aceptación para el Fix:
- Implementar validación de sesión en el lado del servidor/middleware antes de renderizar la ruta protegida `/cuenta`.
- Redirigir a usuarios no autenticados a `/login?redirect=/cuenta`.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>

https://github.com/user-attachments/assets/9de1edca-34e6-4d84-9299-07b7b20ac8f6

<br>
</details>

---

### [BUG-01] Las giftcards compradas no se persisten en los perfiles de los usuarios.

- **Severidad:** Crítica
- **Prioridad:** P1
- **Justificación:** Falla crítica en la persistencia de datos transaccionales. El usuario abona la giftcard pero nunca se vincula a su perfil.

#### Pasos para reproducir:
1. Iniciar sesión con un usuario válido (`demo@giftitto.com` / `demo123`).
2. Completar exitosamente el flujo de compra de una Giftcard.
3. Navegar a la sección "Mi cuenta" -> "Mis Giftcards".

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** La giftcard recién adquirida debe quedar asociada permanentemente al ID del usuario y figurar en su colección de "Mis Giftcards".
- **Resultado Real:** La vista "Mi cuenta" no muestra ni persiste la giftcard adquirida en ninguna instancia.

#### Criterios de Aceptación para el Fix:
- Garantizar que la transacción del checkout asocie correctamente al usuario autenticado con el registro de la giftcard en la base de datos.
- El endpoint que se consulta en "Mi cuenta" -> "Mis Giftcards", debe retornar todas las giftcards asociadas al usuario.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>

  https://github.com/user-attachments/assets/cc6365e9-ab7f-4653-be23-e4f3a02a5b30

<br>
</details>

---

### [BUG-02] Pérdida de ítems al procesar compras múltiples de Giftcards ($N > 1$)

- **Severidad:** Alta
- **Prioridad:** P1
- **Justificación:** Bug importante en la lógica del carrito/checkout. Provoca cobros inconsistentes o pérdida de cupones para el usuario al procesar cantidades mayores a 1 unidad.

#### Pasos para reproducir:
1. Seleccionar una Giftcard y ajustar la cantidad deseada a $N > 1$ (ej. 3 unidades).
2. Confirmar el flujo de compra simulada.
3. Llegar a la pantalla de compra exitosa y revisar los cupones entregados.

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** El backend debe generar y retornar la cantidad de $N$ cupones/giftcards solicitadas.
- **Resultado Real:** La respuesta y la pantalla de confirmación solo retornan 1 único cupón/giftcard, perdiéndose las unidades restantes.

#### Criterios de Aceptación para el Fix:
- La API de checkout debe iterar y generar la matriz completa de cupones según la cantidad recibida en el payload de la transacción.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>
  
  https://github.com/user-attachments/assets/70974ad6-8938-4741-bc81-3a860f689fcf
  
<br>
</details>

---

### [BUG-03] El estado global de sesión no se actualiza al iniciar sesión correctamente

- **Severidad:** Alta
- **Prioridad:** P1
- **Justificación:** Genera fricción en la experiencia de usuario. Da la falsa sensación de que el login falló, forzando a realizar una recarga manual para acceder a las funcionalidades de usuario logueado.

#### Pasos para reproducir:
1. Navegar a la pantalla de Login e ingresar credenciales válidas (`demo@giftitto.com` / `demo123`).
2. Hacer clic en "Ingresar".
3. Observar el Navbar y la pantalla principal tras la redirección a la Home.

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** El header debe actualizar el estado global del usuario, ocultando el botón "Ingresar" y mostrando el avatar/menú de usuario.
- **Resultado Real:** El usuario es redirigido a la Home pero el header continúa mostrando el botón "Ingresar". El estado solo se corrige tras ejecutar un Refresh manual (`F5`).

#### Criterios de Aceptación para el Fix:
- El contexto de la sesión debe cambiar de manera reactiva al recibir la respuesta `200 OK` del endpoint de Login.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>
  
  https://github.com/user-attachments/assets/43376011-ca54-4250-b08e-924bf5612443
  
<br>
</details>

---

### [BUG-04] Petición redundante y doble renderizado al cargar la vista de Login

- **Severidad:** Media
- **Prioridad:** P2

#### Pasos para reproducir:
1. Navegar a la pantalla de Login (Botón "Ingresar").

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** Se debe efectuar una única validación de sesión si corresponde.
- **Resultado Real:** El componente se re-renderiza innecesariamente y envía petición `GET /api/usuario/me 401 (Unauthorized)`.

#### Criterios de Aceptación para el Fix:
- Controlar el disparador del efecto secundario en la vista de Login para garantizar un único llamado al montar el componente / vista.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>
  
  https://github.com/user-attachments/assets/450d377a-19a2-467f-98d5-eba0a2d5b3c9
  
<br>
</details>

<details>
<summary> Ver evidencia en captura </summary>
  
<img width="1913" height="994" alt="image" src="https://github.com/user-attachments/assets/c3d31540-29f9-4bcb-8136-6ab37259e5aa" />

</details>

---

### [BUG-05] Omisión de feedback visual/notificación ante credenciales de acceso inválidas

- **Severidad:** Media
- **Prioridad:** P2

#### Pasos para reproducir:
1. Ingresar al formulario de Login.
2. Introducir un correo y contraseña aleatorios e inválidos.
3. Presionar "Ingresar".

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** Mostrar un mensaje claro de error (ej: *"Credenciales inválidas"* o *"Usuario/contraseña incorrectos"*).
- **Resultado Real:** El formulario no despliega ninguna notificación o toast de alerta, dejando al usuario sin contexto sobre el fallo.

#### Criterios de Aceptación para el Fix:
- Manejar la respuesta HTTP del backend y mapear un mensaje de error accesible visible en el formulario.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>
  
  https://github.com/user-attachments/assets/f5f4b2bd-704c-4130-8f8f-c80211b77325
  
<br>
</details>

---

### [BUG-06] Inconsistencia entre el inventario visible y el límite máximo de selección

- **Severidad:** Baja
- **Prioridad:** P3
- **URL:** `https://giftitto-qa.vercel.app/producto/cinemax-2000`

#### Pasos para reproducir:
1. Navegar al detalle de la Giftcard Cinemax $2000.
2. Leer la sección "Detalles" de la descripción.
3. Intentar seleccionar la cantidad máxima permitida en el selector de unidades.

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** Si la descripción e inventario indican 15 unidades disponibles, el selector debe permitir elegir hasta 15 unidades.
- **Resultado Real:** La descripción indica 15 disponibles, pero el control numérico restringe la selección a un máximo de 10 unidades.

#### Criterios de Aceptación para el Fix:
- Validar la regla de negocio: alinear el valor estático de la descripción con el stock real de la base de datos.

<details>
<summary> Ver evidencia en captura </summary>
  
<img width="1517" height="956" alt="image" src="https://github.com/user-attachments/assets/e18f99c2-b79f-4c67-b0da-c33bf3d795e9" />

</details>

---

### [BUG-07] El botón "Compartir" en el cupón muta erróneamente su etiqueta a "Copiado"

- **Severidad:** Baja
- **Prioridad:** P3

#### Pasos para reproducir:
1. En la pantalla de compra exitosa, hacer clic en el botón "Copiar código".

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** El botón "Compartir" debe mantenerse y no cambiar su etiqueta.
- **Resultado Real:** El botón "Compartir" cambia su etiqueta a "Copiado" temporalmente, confundiendo la acción de compartir con la de copiar al portapapeles.

#### Criterios de Aceptación para el Fix:
- El estado temporal de confirmación (etiqueta "Copiado!" o toast informativo) debe aplicarse **únicamente** sobre el botón "Copiar código", manteniendo la etiqueta e icono del botón "Compartir" inalterados.

<details>
<summary><b>🎥 <code>VER EVIDENCIA EN VIDEO (CLICK AQUÍ PARA DESPLEGAR)</code></b></summary>
<br>
  
  https://github.com/user-attachments/assets/5da65e1f-1fb9-46a6-b03c-e7fb3e5f667e
  
<br>
</details>

---

### [BUG-08] Botón "Favorito" inoperativo en el detalle de Giftcard

- **Severidad:** Baja
- **Prioridad:** P3

#### Pasos para reproducir:
1. Ingresar a una giftcard desde la Home.
2. En la ficha de producto, hacer clic en el icono del corazón ("Favorito").

#### Resultado Esperado vs. Resultado Real:
- **Resultado Esperado:** Si el usuario no está logueado, redirigir a `/login`. Si está logueado, marcar la card como favorita.
- **Resultado Real:** El botón no ejecuta ninguna acción, evento ni proporciona retroalimentación.

#### Criterios de Aceptación para el Fix:
- Si el usuario no está autenticado, redirigir a `/login?redirect=/producto/[id]`.
- Si está autenticado, alternar (*toggle*) el estado del icono de corazón y persistir su favorito correctamente.

---

## 4. Propuestas de Mejora de Experiencia de Usuario (Enhancements)

* **[ENH-01] Optimización del Flujo de Compra desde la Home:**
  * **Problema:** En la sección "Regalos Disponibles" de la Home, presionar el botón "Comprar" ejecuta directamente la compra y redirige a la pantalla de éxito sin confirmación previo ni selección de opciones.
  * **Propuesta:** Reemplazar el botón "Comprar" en la Home por "Ver Detalle" o "Seleccionar". La Home no debería ejecutar transacciones directas de un solo clic sin pasar por el resumen de compra/confirmación.
* **[ENH-02] Calidad Visual e Interacción en Categorías:**
  * **Corrección Ortográfica:** Agregar tildes faltantes en las etiquetas de categorías en la Home (`Gastronomía`, `Café`, `Tecnología`).
  * **Feedback de Selección (Hover States):** Mejorar el estado `:hover` de las cards de categorías. Actualmente solo proyecta un sombreado inferior sutil; se recomienda agregar un cambio de borde, escala leve o cambio de color para indicar claramente la interactividad.
* **[ENH-03] Limpieza de UI en Detalle de Producto:**
  * Remover el texto estático "Detalle" ubicado junto a la flecha de navegación de retorno, ya que no aporta contexto relevante.
 
    <details>
    <summary> Ver ubicación </summary>
  
    <img width="1467" height="957" alt="image" src="https://github.com/user-attachments/assets/f402b15b-a9f4-4e52-84a5-113ad75992d2" />

    </details>

---

## 5. Automatización E2E (complemento del challenge)

Además del testing exploratorio, se dejó un **proyecto mínimo de Playwright (JavaScript)** para mostrar criterio de automatización: un único flujo E2E de **login** sobre [Giftitto QA](https://giftitto-qa.vercel.app/), con Page Object Model simplificado (`pages/loginPage.js` + `tests/login.spec.js`).

No pretende ser una suite completa. Cubre el happy path de autenticación (credenciales demo `demo@giftitto.com` / `demo123`) y valida que la sesión queda activa vía `GET /api/usuario/me`, sin depender del estado del navbar (ver **BUG-03**).

```bash
npm install
npx playwright install chromium
npm test
```

`npm run test:headed` abre el browser; `npm run test:report` muestra el reporte HTML.
