const express = require('express');
const router = express.Router();
const xlstojson = require("xls-to-json");

router.get('/', (req, res) => {
    const http = require('http');
    const fs = require('fs');

    const file = fs.createWriteStream("cotizaciones.xlsx");
    const request = http.get("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", function(response) {
      response.pipe(file);
    });
    res.render('index');
});

router.get('/apiarchivo', (req,res) => {
  xlstojson({
    input: "./cotizaciones.xlsx",  // input xls
    output: "cotizaciones.json", // output json
    lowerCaseHeaders:true
  }, function(err, result) {
    if(err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

module.exports = router;