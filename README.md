# Scraping de Precios Unitarios Unificados

Este proyecto realiza el scraping de precios unitarios unificados publicados en la web de El Peruano, almacena los datos en una base de datos PostgreSQL y exporta los resultados a un archivo JSON.

## Requisitos

- Node.js >= 16
- PostgreSQL (con la base de datos y tablas correspondientes)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd scraping-precios-unitarios-unificados
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en el archivo `.env` (ver ejemplo abajo).

## Uso

Ejecuta el script principal:

```bash
node index.js
```

Esto hará lo siguiente:
- Realizará scraping de la página objetivo.
- Insertará los precios obtenidos en la base de datos PostgreSQL.
- Exportará los datos a `precios_obtenidos.json`.

## Estructura de Archivos

- `index.js`: Script principal que realiza el scraping, inserta en la base de datos y exporta a JSON.
- `db/`: Lógica de conexión y utilidades para la base de datos.
- `lib/`: Funciones auxiliares y tipos.
- `precios_obtenidos.json`: Archivo generado con los datos extraídos.
- `.env`: Variables de entorno para la configuración de la base de datos.

## Ejemplo de archivo `.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_base_datos
```

## Notas
- Asegúrate de que la base de datos y las tablas estén creadas antes de ejecutar el script.
- El scraping se realiza sobre la página: https://busquedas.elperuano.pe/dispositivo/NL/2316069-1

## Licencia

MIT 