## The Librarian

Una biblioteca retrofuturista para tus marcadores.

![Página de inicio](https://github.com/user-attachments/assets/524a78d9-73c4-4cfd-8653-3e94456af110)

## Una pequeña historia

De múltiples navegadores y dispositivos: debido a mi trabajo tengo que usar múltiples navegadores en múltiples dispositivos. Cada uno de ellos requiere una cuenta asociada a su propio entorno para poder sincronizar los marcadores. Y esas cuentas no son compatibles entre sí. ¿Dónde guardé el artículo que estaba leyendo el otro día? ¿Cómo se llamaba el portafolio que me dejó soprendido?

## ¿Qué puedo hacer con The Librarian?

Con The Librarian puedes añadir y guardar tus marcadores allá donde vayas. Independientemente del navegador. Solo debes entrar, autenticarte con Clerk, y listo. Puedes organizarlos el múltiples colecciones y organizarlos a tu gusto.

![Sitios Top](https://github.com/user-attachments/assets/d84eccd5-ad44-4f7e-aea1-23d379202720)

## ¿Cómo lo puedo usar?

Abre la URL de The Librarian, inicia sesión con tu cuenta de GitHub, Google o Microsoft; o bien con tu nombre de usuario.

> [!IMPORTANT]
> Advertencia: Debido a un bug en el despliegue a Vercel, la primera vez que abres The Librarian es necesario recargar la página. No es necesario volver a hacerlo después

En la página Sitios Top, puedes hacer clic en cualquier baldosa vacía, añades la URL del marcador y su título, y lo guardas. The Librarian automáticamente intentará conseguir una captura de pantalla de la URL.

En la página Colecciones, puedes ver la lista completa de los marcadores añadidos a una colección, editar tanto las colecciones como los marcadores; o eliminarlos. La vista en estilo CoverFlow fue implementada usando únicamente animaciones en CSS :)

![Colecciones](https://github.com/user-attachments/assets/23066ce3-b27d-4926-9b20-4a2074fb3824)

## ¿En qué está hecho The Librarian?

- **Astro:** como framework que sostiene todos los demás componentes
- **React:** para añadir la interactividad necesaria
- **Clerk:** permite a los usuarios registrarse en The Librarian
- **Dexie:** la base de datos local donde se guardan primero todos los registros
- **Turso:** la base de datos en la nube para sincronizar los registros

## Otras tecnologías utilizadas

- **Cloudflare WebWorkers API:** se encarga de conseguir la captura de pantalla del sitio agregado

### ¿Dónde encuentro a The Librarian?

- Proyecto desplegado: https://project-librarian.vercel.app/
- Repositorio de código: https://github.com/eramajarvi/project-librarian
