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
  var workbook2 = XLSX.readFile('cotizaciones2.xlsx',{sheetStubs: true});
  var sheet_name_list = workbook2.SheetNames;
  sheet_name_list.forEach(function(y) {
  var worksheet = workbook.Sheets[y];
  var headers = {};
  var data = [];
  var value;
  var datos = [];
  for(z in worksheet) {
     if(z[0] === '!') continue;
     //parse out the column, row, and value
     var col = z.substring(0,2);
     var row = parseInt(z.substring(4,5));
     value = worksheet[z].v;
     console.log(value);
     value = "+"+value+"+";
     //store header names
     if(row == 1) {
         headers[col] = value;
         continue;
     }
     if(!data[row]) data[row]={};
     data[row][headers[col]] = value;
     datos.push(value);
  }
  //drop those first two rows which are empty
  data.shift();
  data.shift();
  //console.log(data);
  let path = "data.txt";
  
  fs.writeFile(path,datos, (err) => {
      if (err) throw err;
  });
  //console.log(headers);
  });
  //console.log(sheet_name_list);  
  /************************************************* */
  /************************************************* */
  /************************************************* */

  // sheet_name_list.forEach(function (y) { /* iterate through sheets */
  //   //var exceljsonObj = [];
  //   var rowObject  =  XLSX.utils.sheet_to_row_object_array(workbook2.Sheets[y]);
  //   exceljsonObj = rowObject;
  //       for(var i=0;i<exceljsonObj.length;i++){
  //       //var recordcount = exceljsonObj.length;
  //       var data = exceljsonObj[i];
  //       // $('#myTable tbody:last-child').append("<tr><td>"+data.ID+"</td><td>"+data.Name+"</td><td>"+data.Months+"</td></tr>");
  //       // }
  //       console.log(data);
  //   //alert(exceljsonObj.length);
       
  //   };
  // });
  /************************************************* */
  /************************************************* */
  /************************************************* */
  //console.log(sheet_name_list);
   var output = XLSX.utils.sheet_to_json(workbook2.Sheets[sheet_name_list], {header: 1,range: 0,raw: true, defval: '',blankRows: false});
  // //var output = XLSX.utils.sheet_to_json(workbook2.Sheets[sheet_name_list], {blankRows: false, defval: ''});
  
  // console.log(output);
  // let path = "output.json";
  
  // fs.writeFile(path,JSON.stringify(output,'',4), (err) => {
  //     if (err) throw err;
  // });
  // //const archivo = JSON.stringify(output, undefined, 2);

  
  //console.log(archivo);
  //res.send(JSON.stringify(output, undefined, 4));
  res.render('index', {archivo: output});
});
router.get('/api/listado', (req,res) => {
  const XLSX = require('xlsx');
  var workbook2 = XLSX.readFile('cotizaciones2.xlsx');
  var sheet_name_list = workbook2.SheetNames;
  //console.log(sheet_name_list);  
  /************************************************* */
  /************************************************* */
  /************************************************* */

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

  for(var R = range.s.r; R <= range.e.r; ++R) {
    for(var C = range.s.c; C <= range.e.c; ++C) {
      console.log('Row : ' + R);
      console.log('Column : ' + C);
      var cellref = XLSX.utils.encode_cell({c:C, r:R}); // construct A1 reference for cell
      console.log(cellref);
      if(!sheet[cellref]) continue; // if cell doesn't exist, move on
      var cell = sheet[cellref];
      console.log(cell.v);
    }
  }


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