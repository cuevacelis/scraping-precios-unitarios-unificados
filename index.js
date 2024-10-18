import { chromium } from "playwright";
import { promises as fs } from "fs";
import {
  areasGeograficas,
  descripcionesColumnasPreciosUnitariosUnificados,
} from "./lib/utils.js";
import getDbPostgres from "./db/db-postgres.js";
import dotenv from "dotenv";
dotenv.config();

async function obtenerDepartamentos() {
  const db = getDbPostgres();

  try {
    const departamentos = await db
      .selectFrom("departamento")
      .selectAll()
      .execute();

    return departamentos;
  } catch (error) {
    console.error("Error al obtener los departamentos:", error);
    throw error;
  }
}

async function extraerInformacionDePagina(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`Navegando a la página: ${url}`);
    await page.goto(url);
    console.log("Iniciando navegación en el navegador...");
    const frameElementHandle = await page.waitForSelector("iframe");
    const frame = await frameElementHandle.contentFrame();
    if (!frame) {
      throw new Error("No se pudo acceder al contenido del iframe.");
    }

    const departamentosDB = await obtenerDepartamentos();

    await frame.waitForSelector("table");
    const fechaPublicacion = await page.$eval(
      "small.text-primary span",
      (element) => element.textContent?.trim() || "Fecha no disponible"
    );
    let precios = [];

    // Extraer precios de la tabla, ignorando las primeras dos filas
    const filas = await frame.$$eval("table tr", (rows) => {
      return Array.from(rows)
        .slice(2)
        .map((row) => {
          const columnas = row.querySelectorAll("td"); // Asegurarse de que sea un elemento HTML
          return Array.from(columnas).map(
            (col) => col.textContent?.trim() || null
          );
        });
    });

    // Procesar las filas extraídas
    filas.forEach((columnas) => {
      const codigoRecurso1a6 = columnas[0] || "N/A";
      columnas.slice(1, 7).forEach((precio, index) => {
        areasGeograficas[index + 1].forEach((geo) => {
          precios.push({
            codigoRecurso: codigoRecurso1a6,
            codigoArea: (index + 1).toString(),
            dep_id: departamentosDB.find((d) =>
              d.dep_nombre.toUpperCase().includes(geo.toUpperCase())
            )?.dep_id,
            dep_nombre: geo,
            precioRecomendado: precio,
            fechaPublicacion: fechaPublicacion,
          });
        });
      });

      const codigoRecurso7a12 = columnas[7] || "N/A";
      columnas.slice(8, 14).forEach((precio, index) => {
        areasGeograficas[index + 1].forEach((geo) => {
          precios.push({
            codigoRecurso: codigoRecurso7a12,
            codigoArea: (index + 1).toString(),
            dep_id: departamentosDB.find((d) =>
              d.dep_nombre.toUpperCase().includes(geo.toUpperCase())
            )?.dep_id,
            dep_nombre: geo,
            precioRecomendadoPorDepartamento: precio,
            fechaPublicacion: fechaPublicacion,
          });
        });
      });
    });

    const preciosConNombre = precios.map((item) => ({
      codigoRecurso: item.codigoRecurso,
      nombreRecurso:
        descripcionesColumnasPreciosUnitariosUnificados[
          Number(item.codigoRecurso)
        ] || "Descripción no disponible",
      codigoArea: item.codigoArea,
      dep_id: item.dep_id,
      dep_nombre: item.dep_nombre,
      precioRecomendadoPorDepartamento: item.precioRecomendadoPorDepartamento,
      fechaPublicacion: item.fechaPublicacion,
    }));
    await browser.close();
    return preciosConNombre;
  } catch (error) {
    console.error("Error al extraer la información de la página:", error);
    await browser.close();
    throw error;
  }
}

async function main() {
  const urlPage = "https://busquedas.elperuano.pe/dispositivo/NL/2335224-1";

  try {
    const precios = await extraerInformacionDePagina(urlPage);
    console.log("Exportando precios a precios_obtenidos.json...");
    await fs.writeFile(
      "precios_obtenidos.json",
      JSON.stringify(precios, null, 2),
      "utf-8"
    );
    console.log("Precios exportados a precios_obtenidos.json");
  } catch (error) {
    console.error("Error ejecutando el scraping:", error);
  }
}

main();
