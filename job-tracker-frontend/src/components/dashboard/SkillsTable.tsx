import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Button, Grid, Input, LinearProgress, Paper, SxProps, TableContainer } from '@mui/material';
import AppStore from "../app/AppStore";
import { AppContext } from "../../index"
import { observer } from "mobx-react-lite";
import { randomId } from '@mui/x-data-grid-generator';
import Axios from "axios";
import { slotShouldForwardProp } from '@mui/material/styles/styled';
import { DataGrid, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';

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
  skillid: GridRowId;
  skillname: string;
  comfortlevel: number;
};

interface SkillCreateParam {
  skillId: string;
  skillName: string;
  comfortLevel: number;
}

const SkillsTable: React.FC = observer(() => {
  const store: AppStore = React.useContext(AppContext);

  const [skillName, setSkillName] = React.useState<string>('');
  const [skillLevel, setSkillLevel] = React.useState<number>(0);
  const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [skills, setSkills] = React.useState<GridRowsProp>([]);

  const handleSubmit = () => {
    setSubmitDisabled(true);

    const newSkill: SkillCreateParam = {
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
      setLoading(true);
    }).then(() => {
      Axios.get(`${baseURL}/skills`, {
        headers: {
          Authorization: `Bearer ${store.session}`,
        },
      }).then((response) => {
        setLoading(false);
        console.log(JSON.stringify(response.data))
        setSkills(response.data);
      })
    });
  };

  const handleDelete = (skillid: number) => {
    // const getDeleteItem = allJobs.filter((row) => row.jobId === jobId);
    const delete_record = { skillid: skillid };
    Axios.delete(`${baseURL}/skills/${skillid}`, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      },
    }).then((response) => {
      Axios.get(`${baseURL}/jobs`, {
        headers: {
          Authorization: `Bearer ${store.session}`,
        },
      }).then((response) => {
        //setAllJobs(response.data);
      });
    });
  };

  const columns: GridColDef []= [
    {
      field: "skillname",
      headerName: "Skill",
      editable: true,
      sortable: true,
      width: 500,
    },
    {
      field: "comfortlevel",
      headerName: "Comfort Level",
      editable: true,
      sortable: true,
      width: 500,
    },
  ];

  const rows: Skill[] = [
    {
      skillid: "22",
      skillname: 'Skill',
      comfortlevel: 11,
    }
  ]

  const dataGridStyles: SxProps = {
    // Required for Data table creation, if data grid doesn't have a height, it errors out(MUI bug):
    height: 500,
  };

  React.useEffect(() => {
    // console.log("Hello from JobsTable");
    // Grab data from backend on page load:
    Axios.get(`${baseURL}/skills`, {
      headers: {
        // Formatted as "Bearer 248743843", where 248743843 is our session key:
        Authorization: `Bearer ${store.session}`,
      },
    }).then((response) => {
      setLoading(false);
      console.log(JSON.stringify(response.data))
      setSkills(response.data);
    });

  }, []);

  if(loading) {
    return <LinearProgress />
  }

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
      <TableContainer component={Paper}>
        <Paper sx={dataGridStyles}>
          <DataGrid 
            columns={columns}
            rows={skills}
            getRowHeight={() => "auto"}
            getRowId={(row) => row.skillid}
            onPageSizeChange={(pageSizeChoice: number) => {setPageSize(pageSizeChoice)}}
            pageSize={pageSize}
            rowsPerPageOptions={[20, 40, 60]}
            // autoPageSize={true}
            experimentalFeatures={{ newEditingApi: true }}
          />
        </Paper>     
      </TableContainer>
    </React.Fragment>
  );
})

export default SkillsTable;
