const express = require('express');
const router = express.Router();
const fs = require("fs");
const XLSX = require('xlsx');

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
      

      for(var x = 0; x < linea.length;x++){
        if(linea[0] == linea[x+1]){
          contadorRepetidos++;
        }          
      }
      linea.splice(0,contadorRepetidos,'');
      var meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      var yearsFixThis = ["1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2011","2012","2013","2014","2015","2016","2017","2018","2019"];
      var exchangeRates = new Object();
      var lastMonth;
      
      var lastYear;
      if(linea[4] != undefined){
        if(yearsFixThis.includes(linea[4])){
          exchangeRates.years = linea[4];
          lastYear = linea[4];
        }else{
          exchangeRates.years = lastYear;
        }
      } 
      if(linea[3] != undefined){  
            
        if(meses.includes(linea[3])){          
          linea.splice(3,0);
          exchangeRates.month = linea[3];
          exchangeRates.day= linea[1];  
          exchangeRates.buyDollar= linea[4];
          exchangeRates.sellDollar= linea[5];
          lastMonth= linea[3];
        }else{
          exchangeRates.month = lastMonth;
          exchangeRates.day= linea[1];  
          exchangeRates.buyDollar= linea[3];
          exchangeRates.sellDollar= linea[4];
        }
      }      
      exchangeRatesJson = JSON.stringify(exchangeRates,null,2);
      jsonData.push(exchangeRatesJson);
      
      datosNuevos2.push(JSON.parse(JSON.stringify(linea,null,2)));
    };
  };
  
  // for(var opa =0;opa<jsonData.length;opa++){
  //   console.log(JSON.parse(jsonData[opa]));
  // }

  // let pathra = "dataTest.json";

  // fs.writeFile(pathra,JSON.stringify(datosNuevos2,null,2), (err) => {
  //   if (err) throw err;
  // });
  // let path = "dataTest2.json";

  // fs.writeFile(path,jsonData, (err) => {
  //   if (err) throw err;
  // });

  });

  res.render('index', {archivo: jsonData});
});


module.exports = router;