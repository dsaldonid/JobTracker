import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Autocomplete, Button, Grid, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    'Elvis Presley',
    'Tupelo, MS',
    312.44,
  ),
  createData(
    1,
    '16 Mar, 2019',
    'Paul McCartney',
    'London, UK',
    866.99,
  ),
  createData(2, '16 Mar, 2019', 'Tom Scholz', 'Boston, MA', 100.81),
  createData(
    3,
    '16 Mar, 2019',
    'Michael Jackson',
    'Gary, IN',
    654.39,
  ),
  createData(
    4,
    '15 Mar, 2019',
    'Bruce Springsteen',
    'Long Branch, NJ',
    212.79,
  ),
];

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function ContactsTable() {
  return (
    <React.Fragment>
      <Title>Contacts</Title>
      <Grid container xs={12} md={12} lg={12}>
        <Grid xs={11} md={11} lg={11}>
          <Autocomplete
          options={rows}
          fullWidth
          getOptionLabel={(option)=>option.name}
          disablePortal
          renderInput={(params) => <TextField {...params} label="Search Contacts" />}
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
            <TableCell>Date Contacted</TableCell>
            <TableCell>Contact Name</TableCell>
            <TableCell>Contact Location</TableCell>
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
