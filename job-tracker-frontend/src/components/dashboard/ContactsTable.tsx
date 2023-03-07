import * as React from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import DialogActions from "@mui/material/DialogActions";
import { observer } from "mobx-react-lite";
import AppStore from "../app/AppStore";
import { AppContext } from "../../index";
import MenuItem from "@mui/material/MenuItem";
import CancelIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  SxProps,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Title from "./Title";
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridRowId,
  GridRowsProp,
  GridRowModes,
  GridRowModesModel,
  GridRenderEditCellParams,
  GridRenderCellParams,
  useGridApiContext,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import moment from "moment";
import { styled } from "@mui/material/styles";
import { randomId } from "@mui/x-data-grid-generator";
import { SubdirectoryArrowRightRounded } from "@mui/icons-material";
import Axios from "axios";
const baseURL = "http://localhost:3003";
// Interface for Jobs:
interface Contact {
  contactId: GridRowId;
  jobId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  followUpDate?: string | Date;
}
interface ContactDB {
  jobid: string;
  contactid: GridRowId;
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  followupdates?: string | Date;
}

function filterResponse(data: ContactDB[]) {
  console.log("send data is: ", data);
  const contactRecord = {
    contactId: "",
    company: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relationship: "",
    notes: "",
    followUpDate: "",
  };
  let filteredResponse = new Array();
  data.forEach((contact: ContactDB) => {
    const contactObject: Contact = Object.create(contactRecord);
    // console.log("contact is: ", contact, contact.lastname, typeof contact);
    // console.log("contactObject is: ", contactObject);
    contactObject.jobId = contact.jobid;
    contactObject.contactId = contact.contactid;
    contactObject.company = contact.company;
    contactObject.firstName = contact.firstname;
    contactObject.lastName = contact.lastname;
    contactObject.email = contact.email;
    contactObject.phone = contact.phone;
    contactObject.relationship = contact.relationship;
    contactObject.notes = contact.notes;
    const newDate = new Date(contact.followupdates);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    contactObject.followUpDate = newDate.toLocaleDateString("en-US", options);
    console.log("contactObject after is: ", contactObject);

    filteredResponse.push(contactObject);
  });
  console.log("filteredResponse: ", filteredResponse);
  return filteredResponse;
}

// export default function ContactsTable({ cookie }: PropTypes) {
const ContactsTable: React.FC = observer(() => {
  const store: AppStore = React.useContext(AppContext);
  const [allContacts, setAllContacts] = React.useState<GridRowsProp>(tableData);
  const [confirmData, setConfirmData] = React.useState<any>(null);
  const [allJobs, setAllJobs] = React.useState<GridRowsProp>(jobTableData);
  const [jobChosen, setJobChosen] = React.useState<string>("");
  const [addContact, setAddContact] = React.useState<Contact>({
    jobId: "",
    contactId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relationship: "",
    notes: "",
    followUpDate: "",
  });
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleJobChange = (event: SelectChangeEvent) => {
    setJobChosen(event.target.value as string);
    // const inputField = event.target.
    const inputValue = event.target.value;
    const newContact = { ...addContact };
    // Typescript typing error workaround:
    // https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b
    newContact["jobId"] = inputValue;
    setAddContact(newContact);
    console.log("new added jo b is: ", newContact, inputValue);
  };
  /*------------------------------------DataTable Initialization Steps------------------------------------*/
  const dataGridStyles: SxProps = {
    // Required datatable configuration:
    height: 500,
  };

  const columns: GridColDef[] = [
    {
      field: "firstName",
      headerName: "First Name",
      width: 150,
      editable: true,
      sortable: true,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 150,
      editable: true,
      sortable: true,
    },
    {
      field: "email",
      headerName: "Email",
      hide: false,
      width: 120,
      editable: true,
      sortable: true,
    },
    {
      field: "company",
      headerName: "Company",
      hide: false,
      width: 120,
      editable: true,
      sortable: true,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 130,
      editable: true,
      sortable: true,
    },
    {
      field: "relationship",
      headerName: "Relationship",
      width: 200,
      editable: true,
      sortable: true,
      renderCell: CustomRenderComponent,
      renderEditCell: CustomEditComponent,
    },

    {
      field: "notes",
      headerName: "Notes",
      width: 150,
      editable: true,
      sortable: true,
      hide: true,
      renderCell: CustomRenderComponent,
      renderEditCell: CustomEditComponent,
    },
    {
      field: "followUpDate",
      headerName: "Follow Up Date",
      width: 120,
      sortable: true,
      // Date Styling addon- Delete if not needed later
      // renderCell: (data) => moment(data).format("YYYY-MM-DD HH:MM:SS"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return (
            <>
              <Button
                onClick={() => setRowSave(params.row.contactId)}
                variant="contained"
              >
                Save
              </Button>
              <pre> </pre>
              <Button
                onClick={() => setRowCancel(params.row.contactId)}
                variant="contained"
              >
                Cancel
              </Button>
            </>
          );
        }
        return (
          <>
            <Button
              sx={{ mr: 1 }}
              onClick={() => setRowEdit(params.row.contactId)}
              variant="contained"
            >
              Update
            </Button>
            <br />
            <Button
              onClick={() => handleDelete(params.row.contactId)}
              variant="contained"
            >
              Delete
            </Button>
          </>
        );
      },
      renderEditCell: (params) => {
        // const isInEditMode =
        //   rowModesModel[params.id]?.mode === GridRowModes.Edit;
        // console.log("what is isInEditMode: ", isInEditMode);
        // if (isInEditMode) {
        return (
          <>
            <Button
              onClick={() => setRowSave(params.row.contactId)}
              variant="contained"
            >
              Save
            </Button>
            <br />
            <GridActionsCellItem
              onClick={() => setRowCancel(params.row.contactId)}
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
            />
          </>
        );
      },
    },
  ];

  function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
  }

  React.useEffect(() => {
    // console.log("Hello from JobsTable");
    // Grab data from backend on page load:
    setLoading(true);
    Axios.get(`${baseURL}/jobs`, {
      headers: {
        // Formatted as "Bearer 248743843", where 248743843 is our session key:
        Authorization: `Bearer ${store.session}`,
      },
    }).then((response) => {
      console.log(
        "response.data from contacts table is for jobs is: ",
        response.data,
        typeof response.data
      );
      let mappedData = response.data.map((job) => {
        return {
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          company: job.company,
          dateCreated: job.dateCreated,
          dateApplied: job.dateApplied,
        };
      });
      console.log("mapped data is: ", mappedData);
      setAllJobs(mappedData);

      setLoading(false);
    });
  }, []);
  // console.log("all jobs is: ", allJobs);
  // allJobs.forEach((job) => {
  //   console.log("all jobs is each: ", job.jobId);
  //   console.log("all jobs is each: ", job.jobTitle);
  //   console.log("all jobs is each: ", job.company);
  // });
  // const getJobData = (data: any) => {
  //   let jobData = [];
  //   data.forEach((object) => {
  //     console.log("the obj is: ", object);
  //   });
  // };

  React.useEffect(() => {
    setLoading(true);
    console.log("Hello from Contacts Table");
    // Grab data from backend on page load:
    setAllContacts(tableData);
    Axios.get(`${baseURL}/contact/dashboard`, {
      headers: {
        // Formatted as "Bearer 248743843", where 248743843 is our session key:
        Authorization: `Bearer ${store.session}`,
        // Authorization: `Bearer ${store.session}`,
      },
    }).then((response) => {
      console.log("print em:", response.data.contact);
      const filteredResponse = filterResponse(response.data.contact);
      console.log("print em after:", filteredResponse);
      setAllContacts(filteredResponse);
    });

    setLoading(false);
  }, []);

  /*------------------------------------Create/Add Row Logic------------------------------------*/

  const handleChangeAddContact = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Store name attribute value and cell value as new field entry:
    const inputField = e.target.getAttribute("name");
    const inputValue = e.target.value;
    const newContact = { ...addContact };
    // Typescript typing error workaround:
    // https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b
    newContact[inputField as keyof typeof newContact] = inputValue;
    setAddContact(newContact);
  };

  const handleAddContactFormSubmit = (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const newContact = {
      contactId: randomId(),
      jobId: addContact.jobId,
      firstName: addContact.firstName,
      lastName: addContact.lastName,
      email: addContact.email,
      phone: addContact.phone,
      relationship: addContact.relationship,
      notes: addContact.notes,
      followUpDate: addContact.followUpDate,
    };
    console.log("new contact is: ", newContact);
    Axios.post(`${baseURL}/contact/createContact`, newContact, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      },
    }).then((response) => {
      // console.log("3nd localhost res is: ", response.data);
      Axios.get(`${baseURL}/contact/dashboard`, {
        headers: {
          // Formatted as "Bearer 248743843", where 248743843 is our session key:
          Authorization: `Bearer ${store.session}`,
          // Authorization: `Bearer ${store.session}`,
        },
      }).then((response) => {
        // console.log("print em:");
        const filteredResponse = filterResponse(response.data.contact);
        setAllContacts(filteredResponse);
      });
    });
  };

  /*------------------------------------Update/Edit Row Logic------------------------------------*/

  // Row editing toggle:
  const setRowEdit = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const setRowSave = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const setRowCancel = (id: GridRowId) => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };
  const handleUpdate = (contactId: number, row: any, params: any) => {
    // const getDeleteItem = allContacts.filter(
    //   (row) => row.contactId === contactId
    // );
    // const updatedContacts = allContacts.filter(
    //   (row) => row.contactId !== contactId
    // );
    console.log("what is row? ", row);
    console.log("what is params? ", params);
    // setAllContacts(
    //   rows.map((row) => (row.id === newRow.id ? updatedRow : row))
    // );
    // console.log("updated contacts are: ", contactId, updatedContacts);
    // setAllContacts(updatedContacts);
    // const delete_record = { contactId: contactId };
    // Axios.delete(`${baseURL}/contact/${jobId}`, {
    //   headers: {
    //     Authorization: `Bearer ${store.session}`,
    //   },
    // }).then((response) => {
    //   Axios.get(`${baseURL}/contacts`, {
    //     headers: {
    //       Authorization: `Bearer ${store.session}`,
    //     },
    //   }).then((response) => {
    //     setAllContacts(response.data);
    //   });
    //   console.log("3nd localhost res is: ", response.data);
    // });
  };

  // Row server updating and dialogs
  const processRowUpdate = React.useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) =>
      new Promise<GridRowModel>((resolve, reject) => {
        setConfirmData({ resolve, reject, newRow, oldRow });
      }),
    []
  );

  const handleDataChangeDialog = (response: string) => {
    const { newRow, oldRow, resolve } = confirmData;
    console.log("New row is: ", newRow, newRow.jobId);
    // If user responds yes, send new row to database, else resolve old row back:
    if (response == "Yes") {
      Axios.put(`${baseURL}/contact/updateContact`, newRow, {
        headers: {
          Authorization: `Bearer ${store.session}`,
        },
      }).then((response) => {
        // setAllJobs(response.data);
        // setPosts(response.data);
        console.log("3nd localhost res is: ", response.data);
        resolve(newRow);
      });
      console.log("this is yestriggers!");
      resolve(newRow);
    } else if (response == "No") {
      console.log("this is triggers!");
      resolve(oldRow);
    }
    setConfirmData(null);
  };

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
        <DialogTitle>Please press Yes to confirm changes</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleDataChangeDialog("No")}>No</Button>
          <Button onClick={() => handleDataChangeDialog("Yes")}>Yes</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Handles Errors:
  const handleProcessRowUpdateError = (error: Error) => {
    console.log(error);
  };

  /*------------------------------------Delete Row Logic------------------------------------*/

  const handleDelete = (contactId: number) => {
    // const getDeleteItem = allContacts.filter(
    //   (row) => row.contactId === contactId
    // );

    const delete_record = { id: contactId };
    console.log("What is: delete_record: ", delete_record);
    Axios.delete(`${baseURL}/contact/deleteContact`, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      },
      data: {
        id: contactId,
      },
    }).then((response) => {
      const updatedContacts = allContacts.filter(
        (row) => row.contactId !== contactId
      );
      setAllContacts(updatedContacts);

      // Axios.get(`${baseURL}/contacts`, {
      //   headers: {
      //     Authorization: `Bearer ${store.session}`,
      //   },
      // }).then((response) => {

      //   setAllContacts(response.data);
      // });
      console.log("3nd localhost res is: ", response.data);
    });
  };

  return (
    <React.Fragment>
      <h2>Contacts</h2>
      <TableContainer component={Paper}>
        <Paper sx={dataGridStyles}>
          {renderConfirmDialog()}
          <DataGrid
            columns={columns}
            rows={allContacts}
            getRowHeight={() => "auto"}
            getRowId={(row) => row.contactId}
            onPageSizeChange={(pageSizeChoice: number) =>
              setPageSize(pageSizeChoice)
            }
            pageSize={pageSize}
            rowsPerPageOptions={[20, 40, 60]}
            // autoPageSize={true}
            experimentalFeatures={{ newEditingApi: true }}
            editMode="row"
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            rowModesModel={rowModesModel}
          />
        </Paper>
        <h2>Add a Contact</h2>
        <form onSubmit={handleAddContactFormSubmit}>
          <FormControl fullWidth>
            <InputLabel id="select-job">Select Job</InputLabel>
            <Select
              labelId="select-job-label"
              id="jobId"
              value={jobChosen}
              label="Job"
              onChange={handleJobChange}
            >
              {allJobs.map((job) => {
                const createdDateCreated = new Date(job.dateCreated);
                const createdDateApplied = new Date(job.dateApplied);
                const options = {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                };
                const dateCreated =
                  createdDateCreated.toLocaleDateString("en-US", options) ??
                  "Value is Blank";
                const dateApplied =
                  createdDateApplied.toLocaleDateString("en-US", options) ??
                  "Value is Blank";
                const dateCreated1 = "tiger";
                return (
                  <MenuItem name={job.jobId} value={job.jobId}>
                    <strong>Company</strong>: {job.company},{"  "}
                    <strong> Job Title</strong>: {job.jobTitle},{"  "}
                    <strong> Date Created</strong>: {dateCreated},{"  "}
                    <strong> Date Applied</strong>: {dateApplied}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            type="text"
            name="firstName"
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
            // value={addJob.job_location}
            required
            placeholder="Enter first name.."
            onChange={handleChangeAddContact}
          ></TextField>
          <TextField
            type="text"
            name="lastName"
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
            // value={addJob.job_location}
            required
            placeholder="Enter last name.."
            onChange={handleChangeAddContact}
          ></TextField>
          <br />
          <TextField
            type="text"
            name="email"
            // value={addJob.salary_est}
            required
            placeholder="Enter email.."
            onChange={handleChangeAddContact}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <TextField
            type="text"
            name="phone"
            // value={addJob.salary_est}
            required
            placeholder="Enter phone.."
            onChange={handleChangeAddContact}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <TextField
            type="text"
            name="relationship"
            // value={addJob.salary_est}
            required
            placeholder="Enter relationship.."
            onChange={handleChangeAddContact}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <br />
          <TextField
            type="text"
            name="notes"
            // value={addJob.salary_est}
            required
            placeholder="Enter notes.."
            onChange={handleChangeAddContact}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <TextField
            type="date"
            name="followUpDate"
            // value={addJob.salary_est}
            required
            onChange={handleChangeAddContact}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
          <br />
          <Button type="submit" variant="contained" color="primary">
            Add Contact
          </Button>
        </form>
      </TableContainer>
    </React.Fragment>
  );
});

export default ContactsTable;

/*------------------------------------Custom Render Components------------------------------------*/

const CustomEditComponent: GridColDef["renderCell"] = (
  params: GridRenderEditCellParams
) => {
  // value will have value of field
  const { id, value, field } = params;
  const apiRef = useGridApiContext();
  return (
    <TextField
      multiline
      variant={"standard"}
      fullWidth
      InputProps={{ disableUnderline: true }}
      maxRows={4}
      disabled={false}
      sx={{
        padding: 1,
        color: "primary.main",
      }}
      onChange={(e) => {
        apiRef.current.setEditCellValue({ id, field, value: e.target.value });
        params.value = e.target.value;
      }}
      defaultValue={params.value}
    />
  );
};

const CustomRenderComponent = (params: GridRenderCellParams<string>) => {
  return (
    <CustomDisabledTextField
      multiline
      variant={"standard"}
      fullWidth
      InputProps={{ disableUnderline: true }}
      maxRows={4}
      disabled={true}
      sx={{
        padding: 1,
        color: "primary.main",
      }}
      defaultValue={params.value}
      value={params.value}
    />
  );
};

// Source: https://stackoverflow.com/questions/70361697/how-to-change-text-color-of-disabled-mui-text-field-mui-v5
const CustomDisabledTextField = styled(TextField)(() => ({
  ".MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#000",
    color: "#000",
  },
}));

// mock data:
// https://mockaroo.com/
const jobTableData: GridRowsProp = [
  {
    jobId: 1,
    jobTitle: "Electrical Engineer",
    dateCreated: "4/22/2022",
    priority: 4,
    status: "Interviewing",
    salary: "$211128.25",
    location: "881 Milwaukee Street",
    notes: "phasellus in felis donec semper sapien a libero nam dui",
    company: "Twitterbridge",
    dateApplied: "8/23/2022",
  },
  {
    jobId: 2,
    jobTitle: "Analog Circuit Design manager",
    dateCreated: "1/11/2023",
    priority: 4,
    status: "Accepted",
    salary: "$102198.34",
    location: "2 Rowland Court",
    notes:
      "morbi sem mauris laoreet ut rhoncus aliquet pulvinar sed nisl nunc rhoncus dui vel sem sed",
    company: "Bluezoom",
    dateApplied: "8/3/2022",
  },
  {
    jobId: 3,
    jobTitle: "Data Coordiator",
    dateCreated: "10/30/2022",
    priority: 3,
    status: "Accepted",
    salary: "$109692.37",
    location: "68150 Paget Circle",
    notes:
      "nulla eget eros elementum pellentesque quisque porta volutpat erat quisque erat eros viverra eget congue eget",
    company: "Feednation",
    dateApplied: "5/1/2022",
  },
  {
    jobId: 4,
    jobTitle: "Computer Systems Analyst IV",
    dateCreated: "10/17/2022",
    priority: 2,
    status: "Bookmarked",
    salary: "$283168.91",
    location: "657 Old Shore Place",
    notes:
      "in faucibus orci luctus et ultrices posuere cubilia curae duis faucibus accumsan odio curabitur convallis",
    company: "Voolith",
    dateApplied: "7/7/2022",
  },
  {
    jobId: 5,
    jobTitle: "Nurse",
    dateCreated: "2/17/2022",
    priority: 2,
    status: "Applied",
    salary: "$86302.25",
    location: "4 Mayfield Circle",
    notes: "sem fusce consequat nulla nisl nunc nisl duis bibendum felis sed",
    company: "Geba",
    dateApplied: "10/11/2022",
  },
  {
    jobId: 6,
    jobTitle: "Junior Executive",
    dateCreated: "2/4/2022",
    priority: 5,
    status: "Applied",
    salary: "$153576.48",
    location: "63 Hintze Lane",
    notes:
      "lorem integer tincidunt ante vel ipsum praesent blandit lacinia erat vestibulum sed magna at nunc commodo placerat praesent",
    company: "Brainverse",
    dateApplied: "12/12/2022",
  },
  {
    jobId: 7,
    jobTitle: "Safety Technician II",
    dateCreated: "11/1/2022",
    priority: 4,
    status: "Applying",
    salary: "$103520.00",
    location: "539 Beilfuss Drive",
    notes:
      "curabitur gravida nisi at nibh in hac habitasse platea dictumst aliquam augue quam sollicitudin vitae consectetuer eget rutrum",
    company: "Meedoo",
    dateApplied: "7/27/2022",
  },
  {
    jobId: 8,
    jobTitle: "Food Chemist",
    dateCreated: "7/12/2022",
    priority: 2,
    status: "Negotiating",
    salary: "$93458.86",
    location: "59085 Calypso Circle",
    notes:
      "mus etiam vel augue vestibulum rutrum rutrum neque aenean auctor gravida sem praesent id massa id",
    company: "Trudeo",
    dateApplied: "7/1/2022",
  },
  {
    jobId: 9,
    jobTitle: "Senior Editor",
    dateCreated: "3/8/2022",
    priority: 2,
    status: "Interviewing",
    salary: "$78292.13",
    location: "55 Vermont Plaza",
    notes:
      "platea dictumst aliquam augue quam sollicitudin vitae consectetuer eget rutrum at lorem integer",
    company: "Dynabox",
    dateApplied: "1/3/2023",
  },
  {
    jobId: 10,
    jobTitle: "Cost Accountant",
    dateCreated: "6/25/2022",
    priority: 1,
    status: "Applying",
    salary: "$249158.87",
    location: "1 Gulseth Hill",
    notes:
      "quam a odio in hac habitasse platea dictumst maecenas ut massa quis augue luctus tincidunt nulla mollis",
    company: "Demimbu",
    dateApplied: "5/24/2022",
  },
  {
    jobId: 11,
    jobTitle: "Analog Circuit Design manager",
    dateCreated: "9/30/2022",
    priority: 1,
    status: "Applying",
    salary: "$105574.26",
    location: "18266 Bay Park",
    notes:
      "erat volutpat in congue etiam justo etiam pretium iaculis justo in hac habitasse platea dictumst etiam faucibus cursus",
    company: "Eimbee",
    dateApplied: "8/21/2022",
  },
  {
    jobId: 12,
    jobTitle: "Nuclear Power Engineer",
    dateCreated: "7/29/2022",
    priority: 1,
    status: "Accepted",
    salary: "$78067.78",
    location: "710 Buena Vista Street",
    notes:
      "malesuada in imperdiet et commodo vulputate justo in blandit ultrices enim lorem ipsum dolor sit",
    company: "Flashspan",
    dateApplied: "9/4/2022",
  },
  {
    jobId: 13,
    jobTitle: "Actuary",
    dateCreated: "9/4/2022",
    priority: 3,
    status: "Applied",
    salary: "$92173.87",
    location: "48 Bluejay Center",
    notes:
      "molestie lorem quisque ut erat curabitur gravida nisi at nibh in hac",
    company: "Digitube",
    dateApplied: "6/2/2022",
  },
  {
    jobId: 14,
    jobTitle: "Physical Therapy Assistant",
    dateCreated: "7/20/2022",
    priority: 4,
    status: "Negotiating",
    salary: "$276896.18",
    location: "24824 Knutson Alley",
    notes:
      "duis aliquam convallis nunc proin at turpis a pede posuere nonummy integer non",
    company: "Meejo",
    dateApplied: "8/24/2022",
  },
  {
    jobId: 15,
    jobTitle: "Media Manager IV",
    dateCreated: "3/30/2022",
    priority: 3,
    status: "Negotiating",
    salary: "$277948.10",
    location: "236 Ramsey Plaza",
    notes:
      "amet cursus id turpis integer aliquet massa id lobortis convallis tortor risus dapibus augue vel accumsan tellus nisi eu orci",
    company: "Kare",
    dateApplied: "2/27/2022",
  },
  {
    jobId: 16,
    jobTitle: "Senior Developer",
    dateCreated: "5/20/2022",
    priority: 1,
    status: "Accepted",
    salary: "$294057.06",
    location: "81255 Hanson Road",
    notes:
      "mi integer ac neque duis bibendum morbi non quam nec dui luctus rutrum",
    company: "Jaxnation",
    dateApplied: "10/21/2022",
  },
  {
    jobId: 17,
    jobTitle: "Human Resources Manager",
    dateCreated: "11/18/2022",
    priority: 1,
    status: "Bookmarked",
    salary: "$84284.63",
    location: "563 Shasta Court",
    notes:
      "vestibulum eget vulputate ut ultrices vel augue vestibulum ante ipsum primis in faucibus",
    company: "Riffwire",
    dateApplied: "11/8/2022",
  },
  {
    jobId: 18,
    jobTitle: "Environmental Tech",
    dateCreated: "3/4/2022",
    priority: 5,
    status: "Applying",
    salary: "$71020.55",
    location: "72270 Delaware Crossing",
    notes:
      "donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit amet lobortis sapien sapien non mi",
    company: "Skidoo",
    dateApplied: "11/9/2022",
  },
  {
    jobId: 19,
    jobTitle: "Junior Executive",
    dateCreated: "1/10/2023",
    priority: 3,
    status: "Accepted",
    salary: "$198800.20",
    location: "554 Crescent Oaks Parkway",
    notes: "pellentesque at nulla suspendisse potenti cras in purus eu magna",
    company: "Fanoodle",
    dateApplied: "3/24/2022",
  },
  {
    jobId: 20,
    jobTitle: "Help Desk Technician",
    dateCreated: "6/9/2022",
    priority: 4,
    status: "Applying",
    salary: "$225549.60",
    location: "8 Lakewood Gardens Hill",
    notes:
      "donec diam neque vestibulum eget vulputate ut ultrices vel augue vestibulum ante ipsum primis in faucibus orci luctus et ultrices",
    company: "Demizz",
    dateApplied: "6/25/2022",
  },
  {
    jobId: 21,
    jobTitle: "Accounting Assistant I",
    dateCreated: "5/21/2022",
    priority: 2,
    status: "Interviewing",
    salary: "$118334.83",
    location: "7 Wayridge Hill",
    notes:
      "sagittis nam congue risus semper porta volutpat quam pede lobortis ligula sit amet eleifend pede",
    company: "Rhyzio",
    dateApplied: "12/6/2022",
  },
  {
    jobId: 22,
    jobTitle: "Geologist II",
    dateCreated: "7/14/2022",
    priority: 3,
    status: "Negotiating",
    salary: "$72982.61",
    location: "9 Pawling Point",
    notes:
      "curae mauris viverra diam vitae quam suspendisse potenti nullam porttitor",
    company: "Meetz",
    dateApplied: "5/20/2022",
  },
  {
    jobId: 23,
    jobTitle: "Physical Therapy Assistant",
    dateCreated: "11/18/2022",
    priority: 4,
    status: "Applying",
    salary: "$284391.47",
    location: "46168 Brown Court",
    notes:
      "felis donec semper sapien a libero nam dui proin leo odio porttitor id consequat",
    company: "Shufflester",
    dateApplied: "4/2/2022",
  },
  {
    jobId: 24,
    jobTitle: "Graphic Designer",
    dateCreated: "12/1/2022",
    priority: 4,
    status: "Applied",
    salary: "$287686.64",
    location: "91671 Kim Drive",
    notes: "eu massa donec dapibus duis at velit eu est congue elementum in",
    company: "Shufflebeat",
    dateApplied: "3/8/2022",
  },
  {
    jobId: 25,
    jobTitle: "Developer IV",
    dateCreated: "11/3/2022",
    priority: 5,
    status: "Interviewing",
    salary: "$115161.59",
    location: "44 Sommers Junction",
    notes:
      "a libero nam dui proin leo odio porttitor id consequat in consequat ut nulla",
    company: "Kanoodle",
    dateApplied: "9/25/2022",
  },
  {
    jobId: 26,
    jobTitle: "Environmental Tech",
    dateCreated: "7/26/2022",
    priority: 1,
    status: "Negotiating",
    salary: "$173022.46",
    location: "940 Fisk Terrace",
    notes:
      "arcu adipiscing molestie hendrerit at vulputate vitae nisl aenean lectus pellentesque eget nunc donec quis orci eget orci vehicula",
    company: "Thoughtworks",
    dateApplied: "4/16/2022",
  },
  {
    jobId: 27,
    jobTitle: "Civil Engineer",
    dateCreated: "12/9/2022",
    priority: 5,
    status: "Applying",
    salary: "$203643.71",
    location: "11651 Hoard Court",
    notes:
      "nascetur ridiculus mus etiam vel augue vestibulum rutrum rutrum neque aenean auctor gravida sem praesent id massa id nisl venenatis",
    company: "Linktype",
    dateApplied: "5/7/2022",
  },
  {
    jobId: 28,
    jobTitle: "Accounting Assistant III",
    dateCreated: "12/30/2022",
    priority: 1,
    status: "Interviewing",
    salary: "$294869.24",
    location: "411 Raven Terrace",
    notes:
      "nunc commodo placerat praesent blandit nam nulla integer pede justo lacinia eget tincidunt eget tempus vel pede morbi porttitor",
    company: "Katz",
    dateApplied: "2/1/2023",
  },
  {
    jobId: 29,
    jobTitle: "Assistant Manager",
    dateCreated: "4/5/2022",
    priority: 3,
    status: "Applied",
    salary: "$133097.41",
    location: "090 Stone Corner Street",
    notes:
      "donec diam neque vestibulum eget vulputate ut ultrices vel augue vestibulum ante ipsum primis",
    company: "Realblab",
    dateApplied: "6/26/2022",
  },
  {
    jobId: 30,
    jobTitle: "Librarian",
    dateCreated: "6/27/2022",
    priority: 1,
    status: "Interviewing",
    salary: "$269585.56",
    location: "7458 Sherman Circle",
    notes:
      "odio justo sollicitudin ut suscipit a feugiat et eros vestibulum ac est lacinia nisi venenatis tristique",
    company: "Divanoodle",
    dateApplied: "7/7/2022",
  },
  {
    jobId: 31,
    jobTitle: "Operator",
    dateCreated: "11/29/2022",
    priority: 2,
    status: "Bookmarked",
    salary: "$127959.28",
    location: "14 Dayton Way",
    notes:
      "turpis elementum ligula vehicula consequat morbi a ipsum integer a nibh in quis justo maecenas rhoncus aliquam lacus",
    company: "Gigaclub",
    dateApplied: "10/24/2022",
  },
  {
    jobId: 32,
    jobTitle: "Desktop Support Technician",
    dateCreated: "7/29/2022",
    priority: 4,
    status: "Interviewing",
    salary: "$165717.69",
    location: "27827 American Pass",
    notes:
      "aliquam augue quam sollicitudin vitae consectetuer eget rutrum at lorem integer tincidunt",
    company: "Skidoo",
    dateApplied: "4/30/2022",
  },
  {
    jobId: 33,
    jobTitle: "Accountant III",
    dateCreated: "10/3/2022",
    priority: 1,
    status: "Interviewing",
    salary: "$263698.54",
    location: "22755 Birchwood Place",
    notes:
      "ut erat curabitur gravida nisi at nibh in hac habitasse platea dictumst aliquam augue quam",
    company: "Gigaclub",
    dateApplied: "11/14/2022",
  },
  {
    jobId: 34,
    jobTitle: "Teacher",
    dateCreated: "9/24/2022",
    priority: 3,
    status: "Negotiating",
    salary: "$232981.73",
    location: "795 Butterfield Hill",
    notes:
      "id lobortis convallis tortor risus dapibus augue vel accumsan tellus nisi",
    company: "Fivechat",
    dateApplied: "10/25/2022",
  },
  {
    jobId: 35,
    jobTitle: "Sales Representative",
    dateCreated: "10/2/2022",
    priority: 5,
    status: "Negotiating",
    salary: "$233525.60",
    location: "70 Daystar Terrace",
    notes:
      "in sagittis dui vel nisl duis ac nibh fusce lacus purus aliquet at feugiat non",
    company: "Mymm",
    dateApplied: "5/15/2022",
  },
  {
    jobId: 36,
    jobTitle: "Information Systems Manager",
    dateCreated: "2/24/2022",
    priority: 5,
    status: "Negotiating",
    salary: "$195320.40",
    location: "93 Katie Crossing",
    notes:
      "curae nulla dapibus dolor vel est donec odio justo sollicitudin ut suscipit a",
    company: "Voomm",
    dateApplied: "1/27/2023",
  },
  {
    jobId: 37,
    jobTitle: "Systems Administrator II",
    dateCreated: "8/29/2022",
    priority: 5,
    status: "Applying",
    salary: "$199668.85",
    location: "835 Vahlen Circle",
    notes:
      "pretium nisl ut volutpat sapien arcu sed augue aliquam erat volutpat in congue etiam justo etiam pretium iaculis",
    company: "Lazz",
    dateApplied: "4/15/2022",
  },
  {
    jobId: 38,
    jobTitle: "Financial Advisor",
    dateCreated: "3/26/2022",
    priority: 5,
    status: "Bookmarked",
    salary: "$81032.82",
    location: "1385 Clove Plaza",
    notes:
      "sodales scelerisque mauris sit amet eros suspendisse accumsan tortor quis turpis",
    company: "Ntag",
    dateApplied: "9/4/2022",
  },
  {
    jobId: 39,
    jobTitle: "GIS Technical Architect",
    dateCreated: "8/10/2022",
    priority: 3,
    status: "Bookmarked",
    salary: "$235754.54",
    location: "45 Alpine Junction",
    notes:
      "est risus auctor sed tristique in tempus sit amet sem fusce consequat nulla",
    company: "Digitube",
    dateApplied: "6/21/2022",
  },
  {
    jobId: 40,
    jobTitle: "Business Systems Development Analyst",
    dateCreated: "8/12/2022",
    priority: 5,
    status: "Accepted",
    salary: "$276058.72",
    location: "02 Hollow Ridge Avenue",
    notes:
      "in quam fringilla rhoncus mauris enim leo rhoncus sed vestibulum sit amet",
    company: "Realmix",
    dateApplied: "10/14/2022",
  },
];

const tableData: GridRowsProp = [
  {
    contactId: 95,
    companyName: "Devshare",
    firstName: "Elna",
    lastName: "O'Sullivan",
    email: "eosullivan2m@irs.gov",
    phone:
      "in quam fringilla rhoncus mauris enim leo rhoncus sed vestibulum sit amet cursus id",
    relationship:
      "felis fusce posuere felis sed lacus morbi sem mauris laoreet ut rhoncus aliquet pulvinar",
    notes: "I want to see this note render!",
    followUpDate: "6/24/2022",
  },
  {
    contactId: 96,
    companyName: "Eabox",
    firstName: "Berty",
    lastName: "Key",
    email: "bkey2n@nifty.com",
    phone:
      "libero non mattis pulvinar nulla pede ullamcorper augue a suscipit nulla elit ac nulla sed vel enim sit amet nunc",
    relationship:
      "posuere cubilia curae donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit amet lobortis",
    notes:
      "ac leo pellentesque ultrices mattis odio donec vitae nisi nam ultrices",
    followUpDate: "1/3/2023",
  },
  {
    contactId: 97,
    companyName: "Minyx",
    firstName: "Wiley",
    lastName: "Chattell",
    email: "wchattell2o@who.int",
    phone:
      "orci nullam molestie nibh in lectus pellentesque at nulla suspendisse potenti cras in purus eu magna",
    relationship:
      "eget elit sodales scelerisque mauris sit amet eros suspendisse accumsan tortor quis turpis sed ante vivamus tortor duis mattis",
    notes:
      "gravida sem praesent id massa id nisl venenatis lacinia aenean sit amet justo morbi ut odio cras mi pede",
    followUpDate: "9/13/2022",
  },
  {
    contactId: 98,
    companyName: "Vinder",
    firstName: "Skipp",
    lastName: "Malzard",
    email: "smalzard2p@youku.com",
    phone:
      "quis libero nullam sit amet turpis elementum ligula vehicula consequat morbi a ipsum integer a",
    relationship:
      "eleifend pede libero quis orci nullam molestie nibh in lectus pellentesque at nulla suspendisse potenti",
    notes:
      "nibh in quis justo maecenas rhoncus aliquam lacus morbi quis tortor id nulla ultrices aliquet maecenas",
    followUpDate: "6/4/2022",
  },
  {
    contactId: 99,
    companyName: "Meemm",
    firstName: "Lazarus",
    lastName: "Danniel",
    email: "ldanniel2q@abc.net.au",
    phone:
      "quisque id justo sit amet sapien dignissim vestibulum vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia",
    relationship:
      "pharetra magna ac consequat metus sapien ut nunc vestibulum ante ipsum primis in faucibus",
    notes:
      "erat fermentum justo nec condimentum neque sapien placerat ante nulla justo",
    followUpDate: "7/23/2022",
  },
  {
    contactId: 100,
    companyName: "Twitterbeat",
    firstName: "Lenee",
    lastName: "Marlowe",
    email: "lmarlowe2r@ow.ly",
    phone:
      "pulvinar sed nisl nunc rhoncus dui vel sem sed sagittis nam congue risus semper porta volutpat quam pede lobortis",
    relationship:
      "ut massa quis augue luctus tincidunt nulla mollis molestie lorem quisque ut erat",
    notes: "nec dui luctus rutrum nulla tellus in sagittis dui vel nisl",
    followUpDate: "12/8/2022",
  },
];
