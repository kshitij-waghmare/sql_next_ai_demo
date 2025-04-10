const express = require('express');
const router = express.Router();
const { saveReportToExcel } = require('../models/reportModel');
const { createDataModelXml} = require('../models/sqlModel');
const { extractOracleError } = require('../models/oracleError');
const { callCreateObjectSoapApi, callRunReportApi } = require('../models/soapApiModel');
const { createReportXml } = require('../models/reportModel');
const userID = process.env.USER_ID;
const password = process.env.PASSWORD;


// Soap API WSDL URLs
const soapApiCatalogUrl = process.env.SOAP_API_WSDL_URL_CATALOG;


// //const { createDataModelXml, createReportXml, callCreateObjectSoapApi, callRunReportApi } = require('../services/reportService');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Endpoint to handle generating the report and saving it
router.post('/frontend-update', async (req, res) => {

    function generateSanitizedReportId() {
      const reportId = `${uuidv4().split('-')[0]}`;
      return reportId.replace(/[~!#$%^&*+`|:"<>?,]/g, '_');
    }
  
  const reportId = generateSanitizedReportId();
  
  const reportFilePath = `/Custom/SQL Automation/SQL-${reportId}-Report.xdo`;
  const dataModelPath = `SQL-${reportId}-Data-Model`;
  const reportPath = `SQL-${reportId}-Report`;
  
    const { reportName, sqlQuery } = req.body;
  
    console.log('Incoming Request:', req.body);  // Log the received data
  
    if (!reportName || !sqlQuery) {
      return res.status(400).send('Report Name and SQL Query are required');
    }
  
    try {
      // Create Data Model XML
      const xmlPayload = createDataModelXml(sqlQuery);
      console.log('xmlPayload',xmlPayload);
  
      // Call createObject SOAP API for Data Model
      const resultDataModel = await callCreateObjectSoapApi(xmlPayload, '/Custom/SQL Automation', dataModelPath, 'xdm', 'Data Model for SQL Query', userID, password, soapApiCatalogUrl);
      console.log('Data Model Created:', resultDataModel);
  
      // Create Report XML
      const reportXmlPayload = createReportXml(reportName, sqlQuery,reportId);
      //console.log('reportXmlPayload: ',reportXmlPayload);
  
      // Call createObject SOAP API for Report
      const resultReport = await callCreateObjectSoapApi(reportXmlPayload, '/Custom/SQL Automation', reportPath, 'xdo', 'Report for SQL Query', userID, password, soapApiCatalogUrl);
      console.log('Report Created:', resultReport);
  
      // Run the Report and Get the CSV Data
      const reportCsv = await callRunReportApi(reportFilePath, userID, password);
  
      // Save the report to the server
      const filePath = await saveReportToExcel(reportCsv, reportName); // Save and get file path
  
   // Return the file path in response
    res.status(200).json({
        success: true,
        csvData: reportCsv,  // Send the actual CSV data
        reportUrl: `/download-report/${path.basename(filePath)}`  // Provide the download link as well
      });

    } catch (error) {
      console.error('Error generating report:', error);
      const oracleError = extractOracleError(error);
      console.log('Extracted Oracle Error:', oracleError);
      res.status(500).send({ success: false, message: 'Error generating report', oracleError: oracleError });
    }
  });
  
  // New download endpoint
  router.get('/download-report/:fileName', (req, res) => {
    const reportDirectory = path.join(__dirname, '..', 'models');
    const fileName = req.params.fileName + '.xlsx';
    const filePath = path.join(reportDirectory, 'reports', fileName);
  
    console.log("File Path: ", filePath); 
    console.log("File Name: ", fileName); 
  
    if (fs.existsSync(filePath)) {
      
      res.download(filePath, fileName, (err) => {
        if (err) {
          res.status(500).send('Error downloading the file');
        }
      });
    } else {
      res.status(404).send('File not found');
    }
  });

module.exports = router;
