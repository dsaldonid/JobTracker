import * as React from "react";
import Axios from "axios";
import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  SxProps,
  Box,
} from "@mui/material";
const baseURL = "http://localhost:3003/authorize";
function Login() {
  const [url_oauth, setUrl_oauth] = React.useState<string>("");

  const authorizeUser = () => {
    Axios.get(baseURL).then((response) => {
      window.location.replace(response.data.url);
      const url = new URL(response.data.url);
      const codeId = url.searchParams.get("code");
      console.log("response.request.responseURL: ", response.request);
      console.log("The code is: ", response.data.url.href);
      console.log("The code is: ", url);
      console.log("The code is: ", codeId);

      //   // setPosts(response.data);
      //   console.log("localhost res is: ", response, response.data.url);
      //   console.log(
      //     "response.request.res.responseUrl res is: ",
      //     response.request.res.responseUrl
      //   );
      //   setUrl_oauth(response.data.url);
    });
  };
  const tokenUser = () => {
    console.log("window.location.href: ", window.location.href);
    console.log("next call..");
  };
  return (
    <>
      <Button onClick={authorizeUser}>Sign in with Google</Button>
      <Button onClick={tokenUser}>tokenUser</Button>
      <a href={url_oauth}>Authorize to get Code</a>
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
