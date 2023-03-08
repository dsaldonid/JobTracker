import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Input,
  LinearProgress,
  Paper,
  SxProps,
  TableContainer,
} from "@mui/material";
import AppStore from "../app/AppStore";
import { AppContext } from "../../index";
import { observer } from "mobx-react-lite";
import { randomId } from "@mui/x-data-grid-generator";
import Axios from "axios";
import { slotShouldForwardProp } from "@mui/material/styles/styled";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowModel,
  GridRowsProp,
} from "@mui/x-data-grid";
const baseURL = "https://job-tracker-postgressql.uw.r.appspot.com";
// const baseURL = "http://localhost:3003";

// Generate Order Data
function createData(id: number, name: string, amount: number) {
  return { id, name, amount };
}

const rows = [
  createData(0, "Plumbing", 69),
  createData(1, "JavaScript", 420),
  createData(2, "Tom Scholz", 100.81),
  createData(3, "Docker", 666),
  createData(4, "Python", 8675309),
];

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface Skill {
  skillid: GridRowId;
  skillname: string;
  comfortlevel: number;
}

interface SkillRequestParam {
  skillId: string;
  skillName: string;
  comfortLevel: number;
}

const SkillsTable: React.FC = observer(() => {
  const store: AppStore = React.useContext(AppContext);

  const [skillName, setSkillName] = React.useState<string>("");
  const [skillLevel, setSkillLevel] = React.useState<number>(0);
  const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(false);
  const [deleteDisabled, setDeleteDisabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [skills, setSkills] = React.useState<GridRowsProp>([]);
  const [confirmData, setConfirmData] = React.useState<any>(null);

  /*------------------------------------Update/Edit Cell Dialog Logic------------------------------------*/

  // Editable Cells: new data saved in confirmData
  // the datagrid API option that I enabled saves the "current row" and "the row before it was edited" so we can access
  // them and pick which one to render based on user confirmation:
  const processRowUpdate = React.useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) =>
      new Promise<GridRowModel>((resolve, reject) => {
        setConfirmData({ resolve, reject, newRow, oldRow });
      }),
    []
  );

  // Handles Errors:
  const handleProcessRowUpdateError = (error: Error) => {
    console.log(error);
  };

  // User chooses dialog options on editted cell:
  const handleDataChangeDialog = (response: string) => {
    console.log(JSON.stringify(confirmData));
    const { newRow, oldRow, resolve } = confirmData;

    const requestParam: SkillRequestParam = {
      skillId: newRow.skillid,
      skillName: newRow.skillname,
      comfortLevel: newRow.comfortlevel,
    };
    // console.log("New row is: ", newRow, newRow.jobId);
    // If user responds yes, send new row to database, else resolve old row back:
    if (response == "Yes") {
      Axios.put(`${baseURL}/skills/${requestParam.skillId}`, requestParam, {
        headers: {
          Authorization: `Bearer ${store.session}`,
        },
      }).then((response) => {
        // setAllJobs(response.data);
        // setPosts(response.data);
        console.log("3nd localhost res is: ", response.data);
        resolve(newRow);
      });
    } else if (response == "No") {
      resolve(oldRow);
    }
    setConfirmData(null);
  };

  // Promise resolved based on user dialog response:
  const renderConfirmDialog = () => {
    // Case 1: Errors:
    if (!confirmData) {
      return null;
    }
    const { newRow, oldRow, resolve } = confirmData;
    console.log("what is row right renderConfirmDialog: ", newRow);

    // Case 2: if new input is same as old input, don't show dialog:
    if (JSON.stringify(newRow) == JSON.stringify(oldRow)) {
      resolve(oldRow);
      setConfirmData(null);
      return;
    }

    // Default Case: render confirmation dialog:
    return (
      <Dialog maxWidth="xs" open={confirmData}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleDataChangeDialog("No")}>No</Button>
          <Button onClick={() => handleDataChangeDialog("Yes")}>Yes</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleSubmit = () => {
    setSubmitDisabled(true);
    setDeleteDisabled(true);

    const newSkill: SkillRequestParam = {
      skillId: randomId(),
      skillName: skillName,
      comfortLevel: skillLevel,
    };

    Axios.post(`${baseURL}/skills`, newSkill, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      },
    })
      .then((response) => {
        setSkillName("");
        setSkillLevel(0);
        setSubmitDisabled(false);
        setDeleteDisabled(false);
        setLoading(true);
        alert("Success");
      })
      .then(() => {
        Axios.get(`${baseURL}/skills`, {
          headers: {
            Authorization: `Bearer ${store.session}`,
          },
        }).then((response) => {
          setLoading(false);
          setSkills(response.data);
          setLoading(false);
        });
      });
  };

  const handleDelete = (skillid: string) => {
    // const getDeleteItem = allJobs.filter((row) => row.jobId === jobId);
    setSubmitDisabled(true);
    setDeleteDisabled(true);
    const delete_record = { skillId: skillid };
    Axios.delete(`${baseURL}/skills/${skillid}`, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      },
    }).then(() => {
      setLoading(true);
      Axios.get(`${baseURL}/skills`, {
        headers: {
          Authorization: `Bearer ${store.session}`,
        },
      }).then((response) => {
        setSubmitDisabled(false);
        setDeleteDisabled(false);
        alert("Successfully deleted");
        setSkills(response.data);
        setLoading(false);
      });
    });
  };

  const columns: GridColDef[] = [
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
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => {
        return (
          <Button
            onClick={() => handleDelete(params.row.skillid)}
            variant="contained"
            disabled={deleteDisabled}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  const rows: Skill[] = [
    {
      skillid: "22",
      skillname: "Skill",
      comfortlevel: 11,
    },
  ];

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
      console.log(JSON.stringify(response.data));
      setSkills(response.data);
    });
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <React.Fragment>
      {renderConfirmDialog()}
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
          spacing={{ xs: 2, md: 2, lg: 2 }}
        >
          <Grid xs={5} md={5} lg={5}>
            <Input
              placeholder="Add skill name..."
              fullWidth
              value={skillName}
              onChange={(event) => {
                setSkillName(event.target.value);
              }}
            />
          </Grid>
          <Grid xs={5} md={5} lg={5}>
            <Input
              placeholder="Add skill comfort level..."
              fullWidth
              type="number"
              value={skillLevel}
              onChange={(event) => {
                setSkillLevel(Number(event.target.value));
              }}
            />
          </Grid>
          <Grid></Grid>
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
            onPageSizeChange={(pageSizeChoice: number) => {
              setPageSize(pageSizeChoice);
            }}
            pageSize={pageSize}
            rowsPerPageOptions={[20, 40, 60]}
            // autoPageSize={true}
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
          />
        </Paper>
      </TableContainer>
    </React.Fragment>
  );
});

export default SkillsTable;
