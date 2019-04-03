const express = require('express');
const router = express.Router();
const fs = require("fs");
const XLSX = require('xlsx');
const pool = require('../database'); // connection to db
const http = require('http');

router.get('/', (req, res) => {

    const file = fs.createWriteStream("cotizaciones.xls");
    const request = http.get("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", function(response) {
      response.pipe(file);
    });
    res.render('index');
});

router.get('/api/today', async(req,res) => {
    var jsonDatas = await pool.query('SELECT * FROM datos_api ORDER BY ID DESC LIMIT 1'); //useless el order by pero puede servir para algun momento
    jsonDatas[0].datos = JSON.parse(jsonDatas[0].datos);
    var linea = jsonDatas[0].datos;
    var nuevaLinea;
    for(var i=0;i<linea.length;i++){
      nuevaLinea = linea[i];
    }
    nuevaLinea = JSON.parse(nuevaLinea);
    res.render('api/getExchangeRates', {archivo: nuevaLinea});
});

router.get('/api', async(req,res) => {
  var year = req.query.year;
  var month = req.query.month;
  var day = req.query.day;

  var meses = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  month = meses[month];

  var jsonDatas = await pool.query('SELECT * FROM datos_api ORDER BY ID DESC LIMIT 1;'); //useless el order by pero puede servir para algun momento
  jsonDatas[0].datos = JSON.parse(jsonDatas[0].datos);
  var linea = jsonDatas[0].datos;
  var nuevaLinea;
  var nuevosDatos = [];
  for(var i=0;i<linea.length-1;i++){
    nuevaLinea = linea[i];
    nuevosDatos[i] = (nuevaLinea);// Me guardo cada linea en un array para luego parsearlo y poder trabajar con el json
  }
  var ultimaLinea= nuevaLinea;
  for(var k=0;k<nuevosDatos.length-1;k++){
    var nuevaLineak = nuevosDatos[k];
    var lineaParseada = JSON.parse(nuevaLineak);
    //console.log(lineaParseada);
    if(lineaParseada.year == year && lineaParseada.day == day && lineaParseada.month == month){//si es todo igual agarro esa fecha
      //console.log(nuevaLinea);
      nuevaLinea = nuevaLineak;
     }
  }
 
  if(ultimaLinea == nuevaLinea){
    nuevaLinea = JSON.parse("{}");    
  }else{
    nuevaLinea = JSON.parse(nuevaLinea);
  }
  //console.log(nuevaLinea);
  res.render('api/getExchangeRates', {archivo: nuevaLinea});
});

router.get('/api/date/:day/:month/:year', async(req,res) => {
  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var meses = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  month = meses[month];

  var jsonDatas = await pool.query('SELECT * FROM datos_api ORDER BY ID DESC LIMIT 1;'); //useless el order by pero puede servir para algun momento
  jsonDatas[0].datos = JSON.parse(jsonDatas[0].datos);
  var linea = jsonDatas[0].datos;
  var nuevaLinea;
  var nuevosDatos = [];
  for(var i=0;i<linea.length-1;i++){
    nuevaLinea = linea[i];
    nuevosDatos[i] = (nuevaLinea);// Me guardo cada linea en un array para luego parsearlo y poder trabajar con el json
  }
  var ultimaLinea= nuevaLinea;
  for(var k=0;k<nuevosDatos.length-1;k++){
    var nuevaLineak = nuevosDatos[k];
    var lineaParseada = JSON.parse(nuevaLineak);
    if(lineaParseada.year == year && lineaParseada.day == day && lineaParseada.month == month){//si es todo igual agarro esa fecha
      nuevaLinea = nuevaLineak;
     }
  }
  
  if(ultimaLinea == nuevaLinea){
    nuevaLinea = JSON.parse("{}");    
  }else{
    nuevaLinea = JSON.parse(nuevaLinea);
  }
  
  res.send(nuevaLinea);
});

router.get('/api/archivo', async(req,res) => {  
  jsonData = await pool.query('SELECT * FROM datos_api');
  jsonData[0].datos = JSON.parse(jsonData[0].datos);
  res.render('api/getExchangeRates', {archivo: jsonData[0]});
});

//TODO: FIX API/GET/ARCHIVO
router.get('/api/get/archivo', async(req,res)=>{  
  
    var workbook =  XLSX.readFile('./cotizaciones.xls'); 
    XLSX.writeFile(workbook, 'cotizaciones2.xlsx');
    var workbook2 = XLSX.readFile('cotizaciones2.xlsx',{sheetStubs: true});
    var sheet_name_list = workbook2.SheetNames;
    var datosNuevos = [];
    var auxRow = 1;
    var jsonData = [];
  
    var exchangeRatesJson;
    var hasMonthAndYear = false;
  
    sheet_name_list.forEach(function(y) {
      var worksheet = workbook2.Sheets[y];
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
      var years=[];
      var fecha = new Date();
      for(var a = 1999; a<=fecha.getFullYear();a++){
        years.push(a);
      }
      
      var contador = 0;
      for(var i = 1; i < datosNuevos.length-1 ;i++){
  
        if(datosNuevos[i] !== undefined){
          var linea = datosNuevos[i].replace('undefined','');
          linea = linea.split(',');
  
          var contadorRepetidos=0;      
          for(var x = 0; x < linea.length;x++){ //Cuento espacios de cada línea
            if(linea[0] == linea[x+1]){
              contadorRepetidos++;
            }          
          }
          linea.splice(0,contadorRepetidos,'');//Borro espacios de cada linea
        
          var meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
          
          var exchangeRates = new Object();//Creo objeto json para guardar cada linea
          var lastMonth; //Helper para parsear el mes     
          var lastYear; //Helper para parsear el año
          contador++;
          if(linea[3] != undefined && !(hasMonthAndYear)){
            if(meses.includes(linea[3]) && years.includes(parseInt(linea[4]))){
              exchangeRates.year = linea[4];
              exchangeRates.month = linea[3];
              exchangeRates.day= linea[1];  
              exchangeRates.buyDollar= linea[5];
              exchangeRates.sellDollar= linea[6];   
            }   
          }
          if(contador<=23){
            hasMonthAndYear=false;
          }else{
            hasMonthAndYear = true;
          }
        
          if(linea[4] != undefined && hasMonthAndYear){ //Agregar el año al json        
            if(years.includes(parseInt(linea[4]))){
              exchangeRates.year = linea[4];
              lastYear = linea[4];
            }else{
              exchangeRates.year = lastYear;
            }
          } 
          if(linea[3] != undefined && hasMonthAndYear){  //Agregar mes, dia, (compra,venta)Dólar
                
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
          
          exchangeRatesJson = JSON.stringify(exchangeRates);//Parseo el json
          jsonData.push(exchangeRatesJson);// Lo guardo en un array para luego mostrarlo en el frontend
        };
      };  
    });
    
    const newData = {
        datos:JSON.stringify(jsonData)
    };
    //console.log(newData);
    await pool.query('UPDATE datos_api set ? WHERE id=1',[newData]);
    res.render('api/get-file');
});

module.exports = router;