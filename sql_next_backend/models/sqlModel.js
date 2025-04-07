const { Parser } = require("node-sql-parser"); // Replace with actual parser library

// Function to extract columns from SQL query
function extractColumnsFromSql(sqlQuery) {
  try {
    const parser = new Parser(); // Assuming 'Parser' is a library you are using for SQL parsing
    const queries = sqlQuery.split("UNION").map((q) => q.trim());
    const columns = new Set();

    // Function to handle extracting columns recursively (for subqueries)
    function extractColumnsFromNode(node) {
      if (!node) return;

      // Handle SELECT nodes (both top-level and subqueries)
      if (node.type === "select") {
        if (node.columns) {
          node.columns.forEach((column) => {
            if (column.as) {
              // If the column has an alias (like AS po_number), add the alias
              columns.add(column.as);
            } else if (column.expr) {
              // Handle different expression types:
              if (column.expr.type === "column_ref") {
                // For qualified columns like table.column, only extract the column part
                columns.add(column.expr.column);
              } else if (column.expr.type === "column") {
                // If it's a simple column (like column name), push it directly
                columns.add(column.expr.column);
              } else if (column.expr.type === "function") {
                // Handle function expressions (e.g., NVL)
                // Add the column used inside the function if applicable
                if (
                  column.expr.args &&
                  column.expr.args[0] &&
                  column.expr.args[0].column
                ) {
                  columns.add(column.expr.args[0].column);
                }
              }
            }
          });
        }
      }

      // Recursively process nested subqueries (in FROM or SELECT clauses)
      if (node.from && Array.isArray(node.from)) {
        node.from.forEach((subquery) => {
          if (subquery.type === "select") {
            extractColumnsFromNode(subquery); // Call recursively for nested SELECT
          }
        });
      }
    }

    // Parse and extract columns from each part of the UNION query
    queries.forEach((query) => {
      try {
        const parsed = parser.astify(query); // Parse SQL query into AST (Abstract Syntax Tree)
        //console.log("AST :",parsed)
        extractColumnsFromNode(parsed);
      } catch (error) {
        console.error("Error parsing part of the SQL query:", error);
      }
    });

    // Clean and return unique column names
    const uniqueColumns = [...columns]
      .map((col) =>
        col
          .replace(/(\w+\.\w+\s+|\s+|\(.*?\))/g, "")
          .split(" ")
          .pop()
      )
      .filter(Boolean);

    // Log the extracted columns
    console.log("Extracted columns:", uniqueColumns);
    return uniqueColumns;
  } catch (error) {
    console.error("Error processing SQL query:", error);
    return [];
  }
}

function createDataModelXml(sqlQuery) {
  // Extract columns from the SQL query
  const columns = extractColumnsFromSql(sqlQuery);

  // If no columns are extracted, return an error or an empty model
  if (columns.length === 0) {
    console.error("No columns extracted from SQL query.");
    return "<!-- No columns to generate XML for -->";
  }

  // Start constructing the XML for the group elements dynamically
  let groupElements = columns
    .map((column, index) => {
      return `
        <element name="${column}" value="${column}" label="${column}" dataType="xsd:string" breakOrder="" fieldOrder="${
        index + 1
      }"/>`;
    })
    .join("\n"); // Join all element strings with newlines for readability

  console.log("Group Elements of Data Model XML: ", groupElements);

  // Construct the full XML, including the dynamically generated elements
  return `<?xml version="1.0" encoding="utf-8"?>
  <dataModel xmlns="http://xmlns.oracle.com/oxp/xmlp" version="2.0" xmlns:xdm="http://xmlns.oracle.com/oxp/xmlp" xmlns:xsd="http://www.w3.org/2001/XMLSchema" defaultDataSourceRef="demo">
     <description>
        <![CDATA[Tetsting]]>
     </description>
     <dataProperties>
        <property name="include_parameters" value="true"/>
        <property name="include_null_Element" value="true"/>
        <property name="include_rowsettag" value="false"/>
        <property name="exclude_tags_for_lob" value="false"/>
        <property name="EXCLUDE_LINE_FEED_AND_CARRIAGE_RETURN_FOR_LOB" value="false"/>
        <property name="xml_tag_case" value="upper"/>
        <property name="generate_output_format" value="xml"/>
        <property name="optimize_query_executions" value="false"/>
        <property name="enable_xml_chunks" value=""/>
        <property name="sql_monitor_report_generated" value="false"/>
     </dataProperties>
     <dataSets>
        <dataSet name="DATAMODEL" type="complex">
           <sql dataSourceRef="ApplicationDB_FSCM">
              <![CDATA[${sqlQuery}]]>
           </sql>
        </dataSet>
     </dataSets>
     <output rootName="DATA_DS" uniqueRowName="false">
        <nodeList name="data-structure">
           <dataStructure tagName="DATA_DS">
              <group name="G_1" label="G_1" source="DATAMODEL">
                  ${groupElements}  <!-- Insert the dynamic elements here -->
              </group>
           </dataStructure>
        </nodeList>
     </output>
     <eventTriggers/>
     <lexicals/>
     <parameters/>
     <valueSets/>
     <bursting/>
     <validations>
        <validation>N</validation>
     </validations>
     <display>
        <layouts>
           <layout name="DATAMODEL" left="0px" top="297px"/>
           <layout name="DATA_DS" left="0px" top="297px"/>
        </layouts>
        <groupLinks/>
     </display>
  </dataModel>`;
}

module.exports = { createDataModelXml, extractColumnsFromSql };
