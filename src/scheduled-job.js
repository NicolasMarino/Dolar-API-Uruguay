
const fs = require("fs");
const XLSX = require('xlsx');
const pool = require('./database.js');
const http = require('http');
const moment = require('moment-timezone');

getArchivo = async() =>{
  const file = fs.createWriteStream("../cotizaciones.xls");
  const request = http.get("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", function(response) {
    response.pipe(file);
  });

  var workbook = XLSX.readFile('../cotizaciones.xls');

  XLSX.writeFile(workbook, '../cotizaciones2.xlsx');
  var workbook2 = XLSX.readFile('../cotizaciones2.xlsx',{sheetStubs: true});
  var sheet_name_list = workbook2.SheetNames;

  var datosNuevos = [];
  var auxRow = 1;
  var jsonData = [];

  var exchangeRatesJson;
  var hasMonthAndYear = false;

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
            exchangeRates.years = lastYear;
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
        console.log(jsonData);
        //datosNuevos2.push(JSON.parse(JSON.stringify(linea,null,2))); //Lo guardo en un archivo, persistencia? o en la bd? TODO
      };
    };  
  });
  jsonData.forEach(element => {
      console.log(element);
  });
  var updated_at = new Date();
  
  var newData = {
      datos:jsonData
  };
  //var id = await pool.query('select * from datos_api');
  //id = id[0].id;

  await pool.query("UPDATE datos_api set ? where id = '1'",[newData]);
};

getArchivo();
