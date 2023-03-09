import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import AppStore from "../app/AppStore";
import { AppContext } from "../..";
import { AppPageState } from "../app/types";
import Copyright from "../shared/Copyright";
import Axios from "axios";

const theme = createTheme();

const baseURL = "http://localhost:3003/authorize";
// const baseURL = "https://job-tracker-postgressql.uw.r.appspot.com/authorize";

const SignInPage: React.FC = observer(() => {
  const authorizeUser = () => {
    Axios.get(baseURL).then((response) => {
      // Move client to URL of redirect site>
      console.log("redirect url is: ", response.data.url);
      window.location.replace(response.data.url);
      const url = new URL(response.data.url);
      const codeId = url.searchParams.get("code");
    });
  };

  const store: AppStore = React.useContext(AppContext);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                authorizeUser();
              }}
            >
              Sign In WIth Google
            </Button>
          </Box>
        </Box>
        <Copyright />
      </Container>
    </ThemeProvider>
  );
});
export default SignInPage;
