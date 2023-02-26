import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Button, Grid, Input } from '@mui/material';
import AppStore from "../app/AppStore";
import { AppContext } from "../../index"
import { observer } from "mobx-react-lite";
import { randomId } from '@mui/x-data-grid-generator';
import Axios from "axios";
import { slotShouldForwardProp } from '@mui/material/styles/styled';

const baseURL = "http://localhost:3003";

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

interface Skill {
  skillId?: string;
  skillName: string;
  comfortLevel: number;
};

const SkillsTable: React.FC = observer(() => {
  const store: AppStore = React.useContext(AppContext);

  const [skillName, setSkillName] = React.useState<string>('');
  const [skillLevel, setSkillLevel] = React.useState<number>(0);
  const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(false);

  const handleSubmit = () => {
    setSubmitDisabled(true);

    const newSkill: Skill = {
      skillId: randomId(),
      skillName: skillName,
      comfortLevel: skillLevel,
    }

    Axios.post(`${baseURL}/skills`, newSkill, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      },
    }).then((response) => {
      setSkillName('');
      setSkillLevel(0);
      setSubmitDisabled(false);
     alert("Success");
    });
  };

  return (
    <React.Fragment>
      <Title>Skills</Title>
      <Grid container xs={12} md={12} lg={12}>
      <Grid
          container
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
          xs={10}
          md={10}
          lg={10}
          spacing={{xs: 2, md:2, lg: 2}}
        >
        <Grid xs={5} md={5} lg={5}>
          <Input
            placeholder='Add skill name...'
            fullWidth
            value={skillName}
            onChange={(event)=> {setSkillName(event.target.value)}}
          />
        </Grid>
        <Grid xs={5} md={5} lg={5}> 
          <Input
            placeholder='Add skill comfort level...'
            fullWidth
            type='number'
            value={skillLevel}
            onChange={(event)=> {setSkillLevel(Number(event.target.value))}}
          />
        </Grid>
        <Grid>
        </Grid>
      </Grid>
        <Grid container xs={2} md={2} lg={2} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={() => {
              handleSubmit();
            }}
            disabled={submitDisabled}
          >
            Add Skill
          </Button>
        </Grid>
      </Grid>
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
})

export default SkillsTable;
