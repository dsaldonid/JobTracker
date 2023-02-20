import * as React from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { observer } from "mobx-react-lite";
import AppStore from "../app/AppStore";
import { AppContext } from "../../index";
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
  phone?: string;
  relationship?: string;
  notes?: string;
  followUpDate?: string | Date;
}
interface ContactDB {
  jobId: string;
  contactid: GridRowId;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  followupdates?: string | Date;
}

function filterResponse(data: ContactDB[]) {
  console.log("send data is: ", data);
  const contactRecord = {
    contactId: "",
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
    contactObject.contactId = contact.contactid;
    contactObject.firstName = contact.firstname;
    contactObject.lastName = contact.lastname;
    contactObject.email = contact.email;
    contactObject.phone = contact.phone;
    contactObject.relationship = contact.relationship;
    contactObject.notes = contact.notes;
    contactObject.followUpDate = contact.followupdates;
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
  /*------------------------------------DataTable Initialization Steps------------------------------------*/
  const dataGridStyles: SxProps = {
    // Required datatable configuration:
    height: 500,
  };

  const columns: GridColDef[] = [
    {
      field: "firstName",
      headerName: "Full Name",
      width: 150,
      editable: true,
      sortable: true,
    },
    {
      field: "lastName",
      headerName: "Full Name",
      width: 150,
      editable: true,
      sortable: true,
    },
    {
      field: "email",
      headerName: "Email",
      hide: true,
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
      width: 350,
      editable: true,
      sortable: true,
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
      // console.log("print em:");
      const filteredResponse = filterResponse(response.data.contact);
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
    // console.log("New row is: ", newRow, newRow.jobId);
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
    console.log("What is: delete_record: ", delete_record)
    Axios.delete(`${baseURL}/contact/deleteContact`, {
      headers: {
        Authorization: `Bearer ${store.session}`,
      }, 
      data: {
        id: contactId 
      }
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
          <TextField
            type="text"
            name="jobId"
            required
            placeholder="Enter job id.."
            onChange={handleChangeAddContact}
            variant="outlined"
            style={{ width: "200px", margin: "5px" }}
          ></TextField>
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
