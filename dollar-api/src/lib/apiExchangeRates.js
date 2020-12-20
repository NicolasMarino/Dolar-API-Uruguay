const express = require("express");
const router = express.Router();
const fs = require("fs");
const xlsx = require("xlsx");
const request = require("request");

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url, { rejectUnauthorized: false })
      .pipe(fs.createWriteStream(path))
      .on("close", callback);
  });
};

router.get("/file", (req, res) => {
  download("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", "./cotizaciones.xlsx", () => {
    res.send("Archivo descargado correctamente");
  });
});

router.get("/get-data", (req, res) => {
  const wbxls = xlsx.readFile("./cotizaciones.xlsx");
  xlsx.writeFile(wbxls, "./cotizaciones.xlsx");
  const workbook = xlsx.readFile("./cotizaciones.xlsx", { sheetStubs: true });
  const worksheet = workbook.Sheets["Cotización al público"];
  const newData = xlsx.utils.sheet_to_json(worksheet);

  let month;
  let year;

  let allDates = [];

  newData.forEach((e) => {
    if (e.__EMPTY !== undefined && e.__EMPTY !== "") {
      month = e.__EMPTY;
    }
    if (e.__EMPTY_1 && e.__EMPTY_1 !== undefined) {
      year = e.__EMPTY_1;
    }

    let newDate = {
      dia: e["Cotizaciones al público -  Principales monedas"],
      month,
      year,
      cotizaciones: {
        dolar_USA: {
          buy: e.__EMPTY_2,
          sell: e.__EMPTY_3,
        },
        dolar_eBrou: {
          buy: e.__EMPTY_5,
          sell: e.__EMPTY_6,
        },
        euro: {
          buy: e.__EMPTY_8,
          sell: e.__EMPTY_9,
        },
        peso_Argentino: {
          buy: e.__EMPTY_11,
          sell: e.__EMPTY_12,
        },
        real: {
          buy: e.__EMPTY_14,
          sell: e.__EMPTY_15,
        },
      },
    };

    allDates.push(newDate);
  });

  res.json(allDates);
});

module.exports = router;
