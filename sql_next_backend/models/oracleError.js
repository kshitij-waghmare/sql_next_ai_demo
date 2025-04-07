// Function to extract Oracle error message from error response
const extractOracleError = (error) => {
    // Check if error response contains Oracle error message in the format 'ORA-xxxx: error message'
    const oracleErrorPattern = /ORA-\d{5}:[^\n]+/;
    const errorString = error.response ? error.response.data : error.message;
    
    const match = errorString.match(oracleErrorPattern);
    
    if (match) {
      return match[0]; // Extracted Oracle error message
    } else {
      return 'No Oracle error found'; // If no match found
    }
  };
  
  module.exports = { extractOracleError };
  