import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';

// Generate Order Data
function createData(
  id: number,
  name: string,
  amount: number,
) {
  return { id, name, amount };
}

const rows = [
  createData(
    0,
    'Plumbing',
    69,
  ),
  createData(
    1,
    'JavaScript',
    420,
  ),
  createData(2, 'Tom Scholz', 100.81),
  createData(
    3,
    'Docker',
    666,
  ),
  createData(
    4,
    'Python',
    8675309,
  ),
];

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function SkillsTable() {
  return (
    <React.Fragment>
      <Title>Skills</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Skill Name</TableCell>
            <TableCell align="right">Comfort Level</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{`${row.amount}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
