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
  //console.log(datosNuevos);
  //jsonData =JSON.parse(datosNuevos);
  for(var i = 1; i < datosNuevos.length;i++){

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
      console.log(linea);
      datosNuevos2.push(linea);
      //datosNuevos2.push(JSON.parse(JSON.stringify(linea,null,2)));
    };
  };
  let pathra = "dataTest.json";

  fs.writeFile(pathra,JSON.stringify(datosNuevos2,null,2), (err) => {
    if (err) throw err;
  });
  

  });
  var datos;
  
  // fs.readFile('./dataTest.json','utf8', function read(err, data) {
  //   if (err) throw err;
  //   datos =JSON.parse(data);
  //   for(var i = 1; i < datos.length;i++){

  //     if(datos[i] !== null){
  //       var linea = datos[i].replace('undefined','');
  //       linea = linea.split(',');
  //       var contadorRepetidos=0;
  //       for(var x = 0; x < linea.length;x++){
  //         if(linea[0] == linea[x+1]){
  //           contadorRepetidos++;
  //         }          
  //       }
  //       linea.splice(0,contadorRepetidos,'');
  //       //datosNuevos2.push(linea);
  //       //datosNuevos2.push(JSON.parse(JSON.stringify(linea,null,2)));
  //     };
  //   };
  //   //console.log(datosNuevos2);
    
  // });
  //console.log(jsonData);
  var output = JSON.stringify(datosNuevos2,null,2);

  res.render('index', {archivo: output});
});
router.get('/api/listado', (req,res) => {
  const XLSX = require('xlsx');
  var workbook2 = XLSX.readFile('cotizaciones2.xlsx');
  var sheet_name_list = workbook2.SheetNames;

  sheet_name_list.forEach(function (y) { /* iterate through sheets */
    //var exceljsonObj = [];
    var rowObject  =  XLSX.utils.sheet_to_row_object_array(workbook2.Sheets[y]);
    exceljsonObj = rowObject;
        for(var i=0;i<exceljsonObj.length;i++){
        //var recordcount = exceljsonObj.length;
        var data = exceljsonObj[i];
        // $('#myTable tbody:last-child').append("<tr><td>"+data.ID+"</td><td>"+data.Name+"</td><td>"+data.Months+"</td></tr>");
        // }
        //console.log(data);
    //alert(exceljsonObj.length);
       
    };
  });

  //var first_sheet_name = workbook2.SheetNames[0];
  
  var sheet = workbook2.Sheets[workbook2.SheetNames[0]];
  var range = XLSX.utils.decode_range(sheet['!ref']);
  console.log(range.s.r);
  console.log(range.e.r);


  // /* Get worksheet */
  // var worksheet = workbook2.Sheets[first_sheet_name];

  // /* Find desired cell */
  // var desired_cell = worksheet[address_of_cell];

  // /* Get the value */
  // var desired_value = (desired_cell ? desired_cell.v : undefined);
  // console.log(desired_value);
  //   var datos;
  //  /// var stream = fs.createReadStream('./output.json');
  //   //stream.setEncoding('utf8');
  //   var datos = JSON.parse("./output.json")
    
  //   console.log(datos);
    

  //   res.send(datos);
});
router.get('/api/archivo/test', (req,res) => {
  function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
      var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
      if(roa.length > 0){
        result[sheetName] = roa;
      }
    });
    return result;
  };
  const XLSX = require('xlsx');
  var workbook2 = XLSX.readFile('cotizaciones2.xlsx');
  var jsonDataa = to_json(workbook2);
  console.log(jsonDataa);
});

module.exports = router;