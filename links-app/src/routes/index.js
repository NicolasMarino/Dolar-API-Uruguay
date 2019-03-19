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
  XLSX.writeFile(workbook, 'cotizaciones2.xlsx');
  var workbook2 = XLSX.readFile('cotizaciones2.xlsx',{sheetStubs: true});
  var sheet_name_list = workbook2.SheetNames;

  var datosNuevos = [];
  var datosNuevos2 = [];
  var auxRow = 1;
  var jsonData = [];

  var exchangeRatesJson;

  sheet_name_list.forEach(function(y) {
  var worksheet = workbook.Sheets[y];
  var value;
  for(z in worksheet) {
     if(z[0] === '!') continue;

     var col = z.substring(0,1);
     var row = parseInt(z.substring(1));
     
     if(worksheet['A'+row]){
      value = worksheet[z].v;
      value = worksheet[col+row].v;
     }
     if(row == auxRow){
       if(worksheet['A'+row]){
        datosNuevos[row] += ","+value.toString();
       }
     }
     if(worksheet['A'+row]){
      datosNuevos[row] = worksheet['A'+row].v.toString()+","+datosNuevos[row];
     }
    auxRow=row;
  }
  datosNuevos.shift();
  datosNuevos.shift();
  
  for(var i = 1; i < datosNuevos.length-1;i++){

    if(datosNuevos[i] !== undefined){
      var linea = datosNuevos[i].replace('undefined','');
      linea = linea.split(',');
      var contadorRepetidos=0;
      jsonData.push(linea);

      for(var x = 0; x < linea.length;x++){
        if(linea[0] == linea[x+1]){
          contadorRepetidos++;
        }          
      }
      linea.splice(0,contadorRepetidos,'');
      datosNuevos2.push(JSON.parse(JSON.stringify(linea,null,2)));
    };
  };
  
  // for(var opa =0;opa<jsonData.length;opa++){
  //   var asd = jsonData[opa];
  //   asd = asd.split(",");
  // }
  console.log(linea);
  var exchangeRates = new Object();
  exchangeRates.day= linea[1];
  exchangeRates.buyDollar= linea[4];
  exchangeRates.sellDollar= linea[5];
  exchangeRatesJson = JSON.stringify(exchangeRates,null,2);

  let pathra = "dataTest.json";

  fs.writeFile(pathra,JSON.stringify(datosNuevos2,null,2), (err) => {
    if (err) throw err;
  });
  

  });
  var datos;
  var output = JSON.stringify(datosNuevos2,null,2);

  res.render('index', {archivo: exchangeRatesJson});
});


module.exports = router;