const express = require('express');
const router = express.Router();
const fs = require("fs");

router.get('/', (req, res) => {
    const http = require('http');
    const fs = require('fs');

    const file = fs.createWriteStream("cotizaciones.xls");
    const request = http.get("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", function(response) {
      response.pipe(file);
    });
    res.render('index');
});

router.get('/api/archivo', (req,res) => {
  
  const XLSX = require('xlsx');
  var workbook = XLSX.readFile('./cotizaciones.xls');
  //console.log(workbook);
  XLSX.writeFile(workbook, 'cotizaciones2.xlsx');
  var workbook2 = XLSX.readFile('cotizaciones2.xlsx');
  var sheet_name_list = workbook2.SheetNames;
  console.log(sheet_name_list);

  //console.log(sheet_name_list);
  var output = XLSX.utils.sheet_to_json(workbook2.Sheets[sheet_name_list], {raw: true, defval:null});
  //console.log(output);
  let path = "output.json";
  
  fs.writeFile(path,JSON.stringify(output, undefined, 4), (err) => {
      if (err) throw err;
  });
  const archivo = JSON.stringify(output, undefined, 4);

  //console.log(archivo);
  //res.send(JSON.stringify(output, undefined, 4));
  res.render('index', {archivo: output});
});
router.get('/api/listado', (req,res) => {
  
  var datos;
 /// var stream = fs.createReadStream('./output.json');
  //stream.setEncoding('utf8');
  var datos = JSON.parse("./output.json")
  
  console.log(datos);
  

  res.send(datos);
});

module.exports = router;