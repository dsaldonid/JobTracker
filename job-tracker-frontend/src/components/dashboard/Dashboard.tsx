import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Chart from "./Chart";
import JobsTable from "./JobsTable";
import { PageType } from "./types";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BoltIcon from "@mui/icons-material/Bolt";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import ContactsTable from "./ContactsTable";
import SkillsTable from "./SkillsTable";
import { AppContext } from "../..";
import LogoutIcon from "@mui/icons-material/Logout";
import { observer } from "mobx-react-lite";
import { AppPageState } from "../app/types";
import Copyright from "../shared/Copyright";
import Axios from "axios";
const drawerWidth: number = 240;
const baseURL = "http://localhost:3000";
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();



const Dashboard: React.FC = observer(() => {
        const [open, setOpen] = React.useState<boolean>(true);
        const [pageType, setPageType] = React.useState<PageType>(PageType.DASHBOARD);
        const [session, setSession] = React.useState<string>("");

        const toggleDrawer = () => {
            setOpen(!open);
        };

        React.useEffect(() => {
            console.log(window.location.search);
            const params = new URLSearchParams(window.location.search);
            const code_redirect = params.get("code");
            console.log("code_redirect: ", code_redirect);
            const baseURL2 = `http://localhost:3003/token?code=${code_redirect}`;
            Axios.get(baseURL2).then((response) => {
                console.log(
                    "sessions key is: ",
                    response.data.session,
                    typeof response.data.session
                );
                setSession(response.data.session);
            });
            // let { tokens } = await oauth2Client.getToken(q.code);
            // console.log("print token: ", tokens);
        }, []);

        const pageContent = () => {
            switch (pageType) {
                case PageType.JOBS:
                    return (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                                <JobsTable cookie={{ session }} />
                            </Paper>
                        </Grid>
                    );
                case PageType.CONTACTS:
                    return (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                                <ContactsTable />
                            </Paper>
                        </Grid>
                    );
                case PageType.SKILLS:
                    return (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                                <SkillsTable />
                            </Paper>
                        </Grid>
                    );
                default:
                    return (
                        <Grid item xs={12} md={12} lg={12}>
                            <h1>The session is {session}</h1>;
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    height: 240,
                                }}
                            >
                                <Chart />
                            </Paper>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    mt: 2,
                                }}
                            >
                                <JobsTable cookie={session} />
                            </Paper>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    mt: 2,
                                }}
                            >
                                <ContactsTable />
                            </Paper>
                        </Grid>
                    );
            }
        };

        return (
            <AppContext.Consumer>
                {(value) => (
                    <ThemeProvider theme={mdTheme}>
                        <Box sx={{ display: "flex" }}>
                            <CssBaseline />
                            <AppBar position="absolute" open={open}>
                                <Toolbar
                                    sx={{
                                        pr: "24px", // keep right padding when drawer closed
                                    }}
                                >
                                    <IconButton
                                        edge="start"
                                        color="inherit"
                                        aria-label="open drawer"
                                        onClick={toggleDrawer}
                                        sx={{
                                            marginRight: "36px",
                                            ...(open && { display: "none" }),
                                        }}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Typography
                                        component="h1"
                                        variant="h6"
                                        color="inherit"
                                        noWrap
                                        sx={{ flexGrow: 1 }}
                                    >
                                        Job Tracker
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                            <Drawer variant="permanent" open={open}>
                                <Toolbar
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        px: [1],
                                    }}
                                >
                                    <IconButton onClick={toggleDrawer}>
                                        <ChevronLeftIcon />
                                    </IconButton>
                                </Toolbar>
                                <Divider />
                                <List component="nav">
                                    <React.Fragment>
                                        <ListItemButton
                                            onClick={() => {
                                                setPageType(PageType.DASHBOARD);
                                            }}
                                            selected={pageType === PageType.DASHBOARD}
                                        >
                                            <ListItemIcon>
                                                <DashboardIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Dashboard" />
                                        </ListItemButton>
                                        <ListItemButton
                                            onClick={() => {
                                                setPageType(PageType.JOBS);
                                            }}
                                            selected={pageType === PageType.JOBS}
                                        >
                                            <ListItemIcon>
                                                <WorkIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Jobs" />
                                        </ListItemButton>
                                        <ListItemButton
                                            onClick={() => {
                                                setPageType(PageType.CONTACTS);
                                            }}
                                            selected={pageType === PageType.CONTACTS}
                                        >
                                            <ListItemIcon>
                                                <PeopleIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Contacts" />
                                        </ListItemButton>
                                        <ListItemButton
                                            onClick={() => {
                                                setPageType(PageType.SKILLS);
                                            }}
                                            selected={pageType === PageType.SKILLS}
                                        >
                                            <ListItemIcon>
                                                <BoltIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Skills" />
                                        </ListItemButton>
                                        <Divider sx={{ my: 1 }} />
                                        <ListItemButton
                                            onClick={() => {
                                                value.setPageState(AppPageState.LOGIN_PAGE);
                                            }}
                                        >
                                            <ListItemIcon>
                                                <LogoutIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Logout" />
                                        </ListItemButton>
                                    </React.Fragment>
                                </List>
                            </Drawer>
                            <Box
                                component="main"
                                sx={{
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === "light"
                                            ? theme.palette.grey[100]
                                            : theme.palette.grey[900],
                                    flexGrow: 1,
                                    height: "100vh",
                                    overflow: "auto",
                                }}
                            >
                                <Toolbar />
                                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                                    <Grid container spacing={3}>
                                        {/* Recent Orders */}
                                        {pageContent()}
                                    </Grid>
                                    <Copyright />
                                </Container>
                            </Box>
                        </Box>
                    </ThemeProvider>
                )}
            </AppContext.Consumer>
        );

});

export default Dashboard;
