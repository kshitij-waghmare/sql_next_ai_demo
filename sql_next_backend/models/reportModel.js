const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

function createReportXml(reportName, sqlQuery, reportId) {
  // console.log("Creating Report XML for report:", reportName);
  return `<?xml version="1.0" encoding="utf-8"?>
  <report xmlns="http://xmlns.oracle.com/oxp/xmlp" xmlns:xsd="http://www.w3.org/2001/XMLSchema" version="2.0" dataModel="true" useBipParameters="true" producerName="fin-financialCommon" parameterVOName="" parameterTaskFlow="" customDataControl="" cachePerUser="true" cacheSmartRefresh="false" cacheUserRefresh="false">
     <dataModel url="/Custom/SQL Automation/SQL-${reportId}-Data-Model.xdm"/>
     <description>
        <![CDATA[Tetsting]]>
     </description>
     <property name="showControls" value="true"/>
     <property name="online" value="true"/>
     <property name="openLinkInNewWindow" value="true"/>
     <property name="autoRun" value="true"/>
     <property name="cacheDocument" value="true"/>
     <property name="showReportLinks" value="true"/>
     <property name="asynchronousRun" value="false"/>
     <property name="priority" value="normal"/>
     <property name="sendOutputAsUrl" value="insLevel"/>
     <property name="cacheDuration" value="30"/>
     <property name="controledByExtApp" value="false"/>
     <property name="ignoreEmailDomainRestrictions" value="false"/>
     <property name="saveXMLForRepublishing" value="true"/>
     <property name="disableMakeOutputPublic" value="false"/>
     <parameters paramPerLine="3" style="parameterLocation:in-horizontal;promptLocation:side;"/>
     <templates default="SQL-${reportId}-REPORT">
        <template label="SQL-${reportId}-REPORT" url="SQL-${reportId}-REPORT.rtf" type="rtf" outputFormat="csv" defaultFormat="csv" locale="en_US" disableMasterTemplate="true" active="true" viewOnline="true"/>
     </templates>
  </report>`;
}

// New function to save the CSV report
const saveReportToFile = async (csvData, reportName) => {
  const reportDirectory = path.join(__dirname, "reports");
  if (!fs.existsSync(reportDirectory)) {
    fs.mkdirSync(reportDirectory);
  }

  const filePath = path.join(reportDirectory, `${reportName}.xlsx`);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  // Convert CSV data into an array of rows
  const rows = csvData
    .trim() // Remove leading/trailing spaces
    .split("\n")
    .map((row) => row.split(","));

  if (rows.length === 0 || rows[0].length === 0) {
    throw new Error("CSV data is empty or invalid.");
  }

  // Extract headers from first row
  const headers = rows[0].map((header) => header?.trim() || "Column"); // Ensure headers exist

  // Define columns properly for auto-sizing
  sheet.columns = headers.map((header, index) => ({
    header: header || `Column${index + 1}`, // Assign default header if missing
    key: `col_${index}`, // Unique key
    width: 10, // Default width (will adjust later)
  }));

  // Add rows (excluding the header row)
  rows.slice(1).forEach((row) => sheet.addRow(row));

  // Apply header formatting
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "000000" } }; // Black text
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D3D3D3" },
    }; // Light gray background
    cell.alignment = { horizontal: "center", vertical: "center" };
  });

  // Apply border and alignment to all cells
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = {
        horizontal: rowNumber === 1 ? "center" : "right",
        vertical: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto-adjust column widths safely
  sheet.columns.forEach((column) => {
    let maxLength = column.header ? column.header.length : 10; // Fallback to 10 if undefined
    column.eachCell({ includeEmpty: true }, (cell) => {
      if (cell.value) {
        maxLength = Math.max(maxLength, cell.value.toString().length);
      }
    });
    column.width = maxLength + 2;
  });

  // Save workbook
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

module.exports = { createReportXml, saveReportToFile };
