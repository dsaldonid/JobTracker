import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Autocomplete, Button, Grid, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Title from './Title';

// Generate Order Data
function createData(
  id: number,
  date: string,
  name: string,
  shipTo: string,
  amount: number,
) {
  return { id, date, name, shipTo, amount };
}

const rows = [
  createData(
    0,
    '16 Mar, 2019',
    'Data Engineer',
    'Tupelo, MS',
    312.44,
  ),
  createData(
    1,
    '16 Mar, 2019',
    'Software Engineer',
    'London, UK',
    866.99,
  ),
  createData(2, '16 Mar, 2019', 'ML Engineer', 'Boston, MA', 100.81),
  createData(
    3,
    '16 Mar, 2019',
    'Fullstack Developer',
    'Gary, IN',
    654.39,
  ),
  createData(
    4,
    '15 Mar, 2019',
    'Programmer Analyst',
    'Long Branch, NJ',
    212.79,
  ),
];

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function JobsTable() {
  return (
    <React.Fragment>
      <Title>Jobs</Title>
      <Grid container xs={12} md={12} lg={12}>
        <Grid xs={11} md={11} lg={11}>
          <Autocomplete
          options={rows}
          fullWidth
          getOptionLabel={(option)=>option.name}
          disablePortal
          renderInput={(params) => <TextField {...params} label="Search Jobs" />}
          />
        </Grid>
        <Grid xs={1} md={1} lg={1} sx={{mt: 1}}>
          <Button>
            <SearchIcon />
        </Button>
        </Grid>
      </Grid>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date Posted</TableCell>
            <TableCell>Job Name</TableCell>
            <TableCell>Job Location</TableCell>
            <TableCell align="right">Salary Estimate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell align="right">{`$${row.amount}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
