import * as React from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Copyright: React.FC = () => {
    return (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }} >
        {'Copyright © '}
        <Link color="inherit" href="https://github.com/dsaldonid/JobTracker">
          Job Tracker
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }

  export default Copyright;