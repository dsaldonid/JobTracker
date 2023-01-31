import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Autocomplete, Button, Grid, TextField, SxProps } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Title from "./Title";
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridRowId,
  GridRowsProp,
} from "@mui/x-data-grid";
import moment from "moment";

// Interface for Jobs:
interface Job {
  id: GridRowId;
  job_name: string;
  job_location: string;
  date_posted: string;
  salary_est: string;
}

// Generate Order Data
function createData(
  id: number,
  date: string,
  name: string,
  shipTo: string,
  amount: number
) {
  return { id, date, name, shipTo, amount };
}

const columns: GridColDef[] = [
  {
    field: "job_name",
    headerName: "Job Name",
    width: 200,
    editable: true,
    sortable: true,
  },
  {
    field: "job_location",
    headerName: "Job Location",
    width: 270,
    editable: true,
    sortable: true,
  },
  {
    field: "salary_est",
    headerName: "Salary Estimate",
    width: 170,
    editable: true,
    sortable: true,
  },
  {
    field: "date_posted",
    headerName: "Date Posted",
    width: 170,
    sortable: true,
    renderCell: (params) =>
      moment(params.row.date_posted).format("YYYY-MM-DD HH:MM:SS"),
  },
];

const dataGridStyles: SxProps = {
  height: 500,
};

const rows = [
  createData(0, "16 Mar, 2019", "Data Engineer", "Tupelo, MS", 312.44),
  createData(1, "16 Mar, 2019", "Software Engineer", "London, UK", 866.99),
  createData(2, "16 Mar, 2019", "ML Engineer", "Boston, MA", 100.81),
  createData(3, "16 Mar, 2019", "Fullstack Developer", "Gary, IN", 654.39),
  createData(
    4,
    "15 Mar, 2019",
    "Programmer Analyst",
    "Long Branch, NJ",
    212.79
  ),
];

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface PropsType {
  title?: string;
}

export default function JobsTable(props: PropsType) {
  const [allJobs, setAllJobs] = React.useState(tableData);
  const [confirmData, setConfirmData] = React.useState<any>(null);
  const [addJob, setAddJob] = React.useState<Job>({
    id: "",
    job_name: "",
    job_location: "",
    date_posted: "",
    salary_est: "",
  });
  const [pageSize, setPageSize] = React.useState<number>(20);

  React.useEffect(() => {
    setAllJobs(tableData);
  }, []);

  const handleAddJob = (e) => {
    e.preventDefault();

    const inputField = e.target.getAttribute("name");
    const inputValue = e.target.value;
    const newJob = { ...addJob };
    newJob[inputField] = inputValue;
    setAddJob(newJob);
  };

  const processRowUpdate = React.useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) =>
      new Promise<GridRowModel>((resolve, reject) => {
        setConfirmData({ resolve, reject, newRow, oldRow });
      }),
    []
  );

  const handleProcessRowUpdateError = (error: Error) => {
    console.log(error);
  };

  const handleAddJobFormSubmit = (e) => {
    e.preventDefault();

    const newJob = {
      id: 1,
      job_name: addJob.job_name,
      job_location: addJob.job_location,
      date_posted: addJob.date_posted,
      salary_est: addJob.salary_est,
    };
    setAllJobs([...allJobs, newJob]);
    // console.log(updateJobs);
  };

  const handleDataChangeDialog = (response) => {
    const { newRow, oldRow, resolve } = confirmData;
    if (response == "Yes") {
      resolve(newRow);
    } else if (response == "No") {
      resolve(oldRow);
    }
    setConfirmData(null);
    console.log("New row to be sent is: ", newRow);
  };

  const renderConfirmDialog = () => {
    if (!confirmData) {
      return null;
    }

    const { newRow, oldRow, resolve } = confirmData;

    // const mutation = computeMutation(newRow, oldRow);

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

  return (
    <React.Fragment>
      <Title>{props.title ? props.title : "Jobs"}</Title>
      <Grid container xs={12} md={12} lg={12}>
        <Grid xs={11} md={11} lg={11}>
          <Autocomplete
            options={rows}
            fullWidth
            getOptionLabel={(option) => option.name}
            disablePortal
            renderInput={(params) => (
              <TextField {...params} label="Search Jobs" />
            )}
          />
        </Grid>
        <Grid xs={1} md={1} lg={1} sx={{ mt: 1 }}>
          <Button>
            <SearchIcon />
          </Button>
        </Grid>
      </Grid>
      <br />
      <h2>MUI TABLE</h2>
      <TableContainer component={Paper}>
        {/* <Table aria-label="simple table" size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className="tableHeader">Date Posted</TableCell>
              <TableCell className="tableHeader">Job Name</TableCell>
              <TableCell className="tableHeader">Job Location</TableCell>
              <TableCell className="tableHeader" align="right">
                Salary Estimate
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allJobs.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.job_name}</TableCell>
                <TableCell>{row.job_location}</TableCell>
                <TableCell>{row.date_posted}</TableCell>
                <TableCell align="right">{`$${row.salary_est}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> */}
        <Paper sx={dataGridStyles}>
          {renderConfirmDialog()}
          <DataGrid
            columns={columns}
            rows={allJobs}
            onPageSizeChange={(pageSizeChoice: number) =>
              setPageSize(pageSizeChoice)
            }
            pageSize={pageSize}
            rowsPerPageOptions={[20, 40, 60]}
            // autoPageSize={true}
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
          />
        </Paper>
        <h2>Add a Job</h2>
        <form onSubmit={handleAddJobFormSubmit}>
          <TextField
            type="text"
            name="job_name"
            // value={addJob.job_name}
            required
            placeholder="Enter a job name.."
            onChange={handleAddJob}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <br />
          <TextField
            type="text"
            name="job_location"
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
            // value={addJob.job_location}
            required
            placeholder="Enter location.."
            onChange={handleAddJob}
          ></TextField>
          <br />
          <TextField
            type="date"
            name="date_posted"
            // value={addJob.date_posted}
            required
            placeholder="Enter location.."
            onChange={handleAddJob}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <br />
          <TextField
            type="text"
            name="salary_est"
            // value={addJob.salary_est}
            required
            placeholder="Enter a salary estimate.."
            onChange={handleAddJob}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <br />
          <Button type="submit" variant="contained" color="primary">
            Add Job
          </Button>
        </form>
      </TableContainer>
    </React.Fragment>
  );
}

// https://mockaroo.com/
const tableData: GridRowsProp = [
  {
    id: 1,
    job_name: "GIS Technical Architect",
    job_location: "5 Declaration Pass",
    date_posted: "9/11/2022",
    salary_est: "314078.29",
  },
  {
    id: 2,
    job_name: "Civil Engineer",
    job_location: "477 Forest Run Crossing",
    date_posted: "10/21/2022",
    salary_est: "464164.57",
  },
  {
    id: 3,
    job_name: "Paralegal",
    job_location: "410 Erie Way",
    date_posted: "9/22/2022",
    salary_est: "147013.86",
  },
  {
    id: 4,
    job_name: "Project Manager",
    job_location: "5611 Kensington Point",
    date_posted: "5/30/2022",
    salary_est: "376847.18",
  },
  {
    id: 5,
    job_name: "Tax Accountant",
    job_location: "33556 Hooker Hill",
    date_posted: "11/15/2022",
    salary_est: "334143.79",
  },
  {
    id: 6,
    job_name: "Structural Analysis Engineer",
    job_location: "828 Fisk Court",
    date_posted: "8/15/2022",
    salary_est: "309857.68",
  },
  {
    id: 7,
    job_name: "Administrative Assistant I",
    job_location: "0253 Spohn Road",
    date_posted: "9/12/2022",
    salary_est: "569708.25",
  },
  {
    id: 8,
    job_name: "Web Designer I",
    job_location: "96971 Bellgrove Street",
    date_posted: "3/22/2022",
    salary_est: "8470.11",
  },
  {
    id: 9,
    job_name: "Assistant Manager",
    job_location: "1322 Daystar Place",
    date_posted: "8/28/2022",
    salary_est: "540359.64",
  },
  {
    id: 10,
    job_name: "Geologist IV",
    job_location: "8916 Reinke Terrace",
    date_posted: "10/6/2022",
    salary_est: "791408.09",
  },
];
