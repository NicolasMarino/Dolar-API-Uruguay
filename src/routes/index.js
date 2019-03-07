const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const http = require('http');
    const fs = require('fs');
    const file = fs.createWriteStream("archivo.xls");
    const request = http.get("http://www.ine.gub.uy/c/document_library/get_file?uuid=1dcbe20a-153b-4caf-84a7-7a030d109471", function(response) {
      response.pipe(file);   
    });
    
    res.render('index');
})

module.exports = router;