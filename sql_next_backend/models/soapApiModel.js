const soap = require("soap");
const soapApiRunReportUrl = process.env.SOAP_API_WSDL_URL_RUN_REPORT;
const { Buffer } = require("buffer");

// 2. Base64 encode the Data Model and Report XML
function encodeToBase64(xmlString) {
  // console.log("Encoding XML to Base64...");
  return Buffer.from(xmlString).toString("base64");
}

async function callCreateObjectSoapApi(
  xmlPayload,
  folderPath,
  objectName,
  objectType,
  objectDescription,
  userID,
  password,
  url
) {
  // console.log("Calling SOAP API for CreateObject...");
  const base64Xml = encodeToBase64(xmlPayload); // Base64 encode the XML payload

  const createObjectXmlPayload = `<?xml version="1.0" encoding="utf-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://xmlns.oracle.com/oxp/service/v2">
     <soapenv:Header/>
     <soapenv:Body>
        <v2:createObject>
           <v2:folderAbsolutePathURL>${folderPath}</v2:folderAbsolutePathURL>
           <v2:objectName>${objectName}</v2:objectName>
           <v2:objectType>${objectType}</v2:objectType>
           <v2:objectDescription>${objectDescription}</v2:objectDescription>
           <v2:objectData>${base64Xml}</v2:objectData>
           <v2:userID>${userID}</v2:userID>
           <v2:password>${password}</v2:password>
        </v2:creat// 3. Create Data Model XML File
  eObject>
     </soapenv:Body>
  </soapenv:Envelope>`;

  // console.log("SOAP Payload for CreateObject:", createObjectXmlPayload);
  const client = await soap.createClientAsync(url);
  const args = {
    folderAbsolutePathURL: folderPath,
    objectName: objectName,
    objectType: objectType,
    objectDescription: objectDescription,
    objectData: base64Xml,
    userID: userID,
    password: password,
  };

  return new Promise((resolve, reject) => {
    client.createObject(args, (err, result) => {
      if (err) {
        // console.error("Error in SOAP CreateObject API call:", err);
        return reject(err);
      }
      // console.log("SOAP CreateObject Response:", result);
      resolve(result);
    });
  });
}

// 6. Call SOAP API for Running Reports (runReport Operation)
async function callRunReportApi(reportAbsolutePath, userID, password) {
  // console.log("Calling SOAP API for Running Report...");
  const url = soapApiRunReportUrl; // PublicReportService WSDL URL
  const soapClient = await soap.createClientAsync(url);

  const runReportRequest = `<?xml version="1.0" encoding="utf-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pub="http://xmlns.oracle.com/oxp/service/public">
     <soapenv:Header/>
     <soapenv:Body>
        <pub:runReport>
           <pub:reportAbsolutePath>${reportAbsolutePath}</pub:reportAbsolutePath>
           <pub:userID>${userID}</pub:userID>
           <pub:password>${password}</pub:password>
           <pub:outputFormat>csv</pub:outputFormat>
        </pub:runReport>
     </soapenv:Body>
  </soapenv:Envelope>`;

  const args = {
    // reportRequest contains the details of the report
    reportRequest: {
      attributeFormat: "csv", // Format of the report, e.g., 'csv'
      attributeLocale: "en-US", // Locale, e.g., 'en-US'
      parameterNameValues: [], // An empty array, or you can add parameters if needed
      reportAbsolutePath: reportAbsolutePath, // Path to the report
    },
    // User credentials
    userID: userID, // Replace with actual user ID
    password: password, // Replace with actual password
  };
  // console.log("Arguments: ", arguments);

  return new Promise((resolve, reject) => {
    soapClient.runReport(args, (err, result) => {
      if (err) {
        console.error("Error in SOAP RunReport API call:", err);
        return reject(err);
      }
      console.log("SOAP RunReport Response:", result);
      // Capture the base64-encoded report data
      const reportBase64 = result.runReportReturn.reportBytes; // The base-64 encoded data
      // console.log("ReportBytpes Base64: ", reportBase64);
      if (typeof reportBase64 === "string") {
        try {
          const decodedBuffer = Buffer.from(reportBase64, "base64"); // Decode base64 to buffer
          const csvData = decodedBuffer.toString("utf-8"); // Convert buffer to CSV string
          resolve(csvData); // Return decoded CSV data
          console.log("Success");
        } catch (e) {
          console.error("Error decoding base64 data:", e);
          reject("Failed to decode base64 report data");
        }
      } else {
        reject("No valid reportBytes found in response or invalid type.");
      }
    });
  });
}

module.exports = { callCreateObjectSoapApi, callRunReportApi };
