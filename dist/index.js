import { chromium } from "playwright";
import { areasGeograficas, descripcionesColumnasPreciosUnitariosUnificados, } from "./lib/utils";
async function extraerInformacionDePagina(url) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        console.log(`Navegando a la página: ${url}`);
        await page.goto(url);
        await page.waitForSelector("table");
        // Extraer precios de la tabla, ignorando las primeras dos filas
        const precios = await page.$$eval("table tr", (rows) => {
            return Array.from(rows)
                .slice(2) // Ignorar las dos primeras filas
                .map((row) => {
                const columnas = row.querySelectorAll("td");
                const codigoRecurso = columnas[0]?.textContent?.trim() || "N/A"; // Código del recurso
                const preciosAreas = Array.from(columnas)
                    .slice(1, 7) // Solo tomamos las columnas de precios (área 1 a 6)
                    .map((col, index) => ({
                    codigoArea: (index + 1).toString(),
                    nombreArea: areasGeograficas[index + 1],
                    precio: col.textContent?.trim() || null,
                }));
                return { codigoRecurso, preciosAreas };
            });
        });
        // Asignar nombre del recurso después
        const preciosConNombre = precios.map((item) => ({
            codigoRecurso: item.codigoRecurso,
            nombreRecurso: descripcionesColumnasPreciosUnitariosUnificados[item.codigoRecurso] || "Descripción no disponible",
            preciosAreas: item.preciosAreas,
        }));
        console.log(`Precios extraídos: ${JSON.stringify(preciosConNombre, null, 2)}`);
        await browser.close();
        return preciosConNombre;
    }
    catch (error) {
        console.error("Error al extraer la información de la página:", error);
        await browser.close();
        throw error;
    }
}
async function main() {
    const url = "https://busquedas.elperuano.pe/api/visor_html/2299081-1";
    try {
        const precios = await extraerInformacionDePagina(url);
        console.log("Precios obtenidos:", precios);
    }
    catch (error) {
        console.error("Error ejecutando el scraping:", error);
    }
}
main();
