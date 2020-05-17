import { AppBar, Toolbar, Typography, IconButton, Button } from '@material-ui/core';
import { Camera } from '@material-ui/icons';

export default function NavBar() {

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <Camera />
        </IconButton>
        <Typography variant="h6" >
          WebRTC Chat
      </Typography>
      </Toolbar>
    </AppBar>
  );
};