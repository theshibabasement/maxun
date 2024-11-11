import { Box, Tabs, Typography, Tab, Paper } from "@mui/material";
import Highlight from "react-highlight";
import Button from "@mui/material/Button";
import * as React from "react";
import { Data } from "./RunsTable";
import { TabPanel, TabContext } from "@mui/lab";
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import { useEffect, useState } from "react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import 'highlight.js/styles/github.css';

interface RunContentProps {
  row: Data,
  currentLog: string,
  interpretationInProgress: boolean,
  logEndRef: React.RefObject<HTMLDivElement>,
  abortRunHandler: () => void,
}

export const RunContent = ({ row, currentLog, interpretationInProgress, logEndRef, abortRunHandler }: RunContentProps) => {
  const [tab, setTab] = React.useState<string>('log');
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    setTab(tab);
  }, [interpretationInProgress])

  useEffect(() => {
    if (row.serializableOutput && Object.keys(row.serializableOutput).length > 0) {
      const firstKey = Object.keys(row.serializableOutput)[0];
      const data = row.serializableOutput[firstKey];
      if (Array.isArray(data)) {
        setTableData(data);
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        }
      }
    }
  }, [row.serializableOutput]);

  // Function to convert table data to CSV format
  const convertToCSV = (data: any[], columns: string[]): string => {
    const header = columns.join(','); // Create CSV header row
    const rows = data.map(row => 
      columns.map(col => JSON.stringify(row[col], null, 2)).join(',')
    ); // Map each row of data to a CSV row
    return [header, ...rows].join('\n'); // Combine header and rows with newline characters
  }

  // Function to download CSV file when called
  const downloadCSV = () => {
    const csvContent = convertToCSV(tableData, columns); // Convert data to CSV format
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Create a Blob object with CSV content
    const url = URL.createObjectURL(blob); // Create a temporary URL for the Blob

    // Create a temporary link to download the CSV file
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv"); // Set the download filename
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(link); // Remove the link element after download
  }

  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} aria-label="run-content-tabs">
            <Tab label="Output Data" value='output' />
            <Tab label="Log" value='log' />
            {/* <Tab label="Input" value='input' /> */}
          </Tabs>
        </Box>
        <TabPanel value='log'>
          <Box sx={{
            margin: 1,
            background: '#19171c',
            overflowY: 'scroll',
            overflowX: 'scroll',
            width: '700px',
            height: 'fit-content',
            maxHeight: '450px',
          }}>
            <div>
              <Highlight className="javascript">
                {interpretationInProgress ? currentLog : row.log}
              </Highlight>
              <div style={{ float: "left", clear: "both" }}
                ref={logEndRef} />
            </div>
          </Box>
          {interpretationInProgress ? <Button
            color="error"
            onClick={abortRunHandler}
          >
            Stop
          </Button> : null}
        </TabPanel>
        <TabPanel value='output' sx={{ width: '700px' }}>
          {!row || !row.serializableOutput || !row.binaryOutput
            || (Object.keys(row.serializableOutput).length === 0 && Object.keys(row.binaryOutput).length === 0)
            ? <Typography>The output is empty.</Typography> : null}

          {row.serializableOutput &&
            Object.keys(row.serializableOutput).length !== 0 &&
            <div>
              <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center' }}>
                <ArticleIcon sx={{ marginRight: '15px' }} />
                Captured Data
              </Typography>
              {Object.keys(row.serializableOutput).map((key) => {
                return (
                  <div key={`number-of-serializable-output-${key}`}>
                    <Typography sx={{ margin: '20px 0px 20px 0px' }}>
                      <a style={{ textDecoration: 'none' }} href={`data:application/json;utf8,${JSON.stringify(row.serializableOutput[key], null, 2)}`}
                        download={key}>Download as JSON</a>
                    </Typography>
                  </div>
                )
              })}
              {tableData.length > 0 ? (
                <>
                  <Button variant="contained" color="primary" onClick={downloadCSV}>
                    Download as CSV
                  </Button>
                  <TableContainer component={Paper} sx={{ maxHeight: 440, marginTop: 2 }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell key={column}>{column}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.map((row, index) => (
                          <TableRow key={index}>
                            {columns.map((column) => (
                              <TableCell key={column}>{row[column]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Box sx={{
                  width: 'fit-content',
                  background: 'rgba(0,0,0,0.06)',
                  maxHeight: '300px',
                  overflow: 'scroll',
                }}>
                  <pre>
                    {JSON.stringify(row.serializableOutput, null, 2)}
                  </pre>
                </Box>
              )}
            </div>
          }
          {row.binaryOutput
            && Object.keys(row.binaryOutput).length !== 0 &&
            <div>
              <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center' }}>
                <ImageIcon sx={{ marginRight: '15px' }} />
                Captured Screenshot</Typography>
              {Object.keys(row.binaryOutput).map((key) => {
                try {
                  const imageUrl = row.binaryOutput[key];
                  return (
                    <Box key={`number-of-binary-output-${key}`} sx={{
                      width: 'max-content',
                    }}>
                      <Typography key={`binary-output-key-${key}`} sx={{ margin: '20px 0px 20px 0px' }}>
                        <a href={imageUrl} download={key} style={{ textDecoration: 'none' }}>Download Screenshot</a>
                      </Typography>
                      <img key={`image-${key}`} src={imageUrl} alt={key} height='auto' width='700px' />
                    </Box>
                  )
                } catch (e) {
                  console.log(e)
                  return <Typography key={`number-of-binary-output-${key}`}>
                    {key}: The image failed to render
                  </Typography>
                }
              })}
            </div>
          }
        </TabPanel>
      </TabContext>
    </Box>
  );
}
