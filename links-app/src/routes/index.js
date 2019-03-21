const express = require('express');
const router = express.Router();
const fs = require("fs");
const XLSX = require('xlsx');
const pool = require('../database'); // connection to db

router.get('/', (req, res) => {
    const http = require('http');
    const fs = require('fs');

    const file = fs.createWriteStream("cotizaciones.xls");
    const request = http.get("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", function(response) {
      response.pipe(file);
    });
    res.render('index');
});
const api = require('../lib/apiExchangeRates');

router.get('/api/archivo', async(req,res) => {
  jsonData = await pool.query('SELECT * FROM datos_api');
  jsonData[0].datos = JSON.parse(jsonData[0].datos);
  res.render('index', {archivo: jsonData[0]});
});


module.exports = router;