const express = require('express');
const router = express.Router();
const fs = require("fs");
const XLSX = require('xlsx');
const http = require('http');

router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;