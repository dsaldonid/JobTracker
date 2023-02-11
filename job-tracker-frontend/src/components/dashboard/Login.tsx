import * as React from "react";
import Axios from "axios";
import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  SxProps,
  Box,
  Paper,
  Typography,
} from "@mui/material";
const baseURL = "http://localhost:3003/authorize";
function Login() {
  const [url_oauth, setUrl_oauth] = React.useState<string>("");

  const authorizeUser = () => {
    Axios.get(baseURL).then((response) => {
      // Move client to URL of redirect site>
      window.location.replace(response.data.url);
      const url = new URL(response.data.url);
      const codeId = url.searchParams.get("code");
    });
  };
  // Backup: Redirect is automatic so delete this later:
  // const tokenUser = () => {
  //   console.log("window.location.href: ", window.location.href);
  //   console.log("next call..");
  // };
  return (
    <>
      <Box sx={{ maxWidth: "md" }}>
        <Typography>Job Tracker Website</Typography>
        <Button onClick={authorizeUser}>Sign in with Google</Button>
      </Box>
      {/* <a href={url_oauth}>Authorize to get Code</a> */}
      {/* {posts?.forEach((post) => (
        <div>
          <h1>{post.title}</h1>
          <p>{post.body}</p>
        </div>
      ))} */}
    </>
  );
}

export default Login;
