import { Loader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Card } from '@mui/material';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import React from 'react';
import { useHistory } from 'react-router-dom';
import DriverSelect from './DriverSelect';

export interface CommandDialogProps {
  /** Is the dialog open? */
  open: boolean;
  /** Function to call when the dialog is closed */
  onClose: () => void;
  /** Function to call when the user confirms the action */
  onConfirm: (data: { clusterName: string; driver: string }) => void;
  /** Command to run, like stop, start, delete... */
  command: string;
  /** The title of the form */
  title?: string;
  /** Is the command about to run? */
  acting: boolean;
  /** Command is actually running. There is some time before running where it can still be cancelled. */
  running: boolean;
  /** Output lines coming from the command. */
  actingLines?: string[];
  /** Is the command done? */
  commandDone: boolean;
  /** should it use a dialog or use a grid? */
  useGrid?: boolean;
  /** The cluster context to act on */
  initialClusterName?: string;
  /** Ask for the cluster name. Otherwise the initialClusterName is used. */
  askClusterName?: boolean;
}

/**
 * A form to confirm a command on a cluster.
 */
export default function CommandDialog({
  open,
  onClose,
  onConfirm,
  command,
  title,
  acting,
  running,
  actingLines,
  commandDone,
  useGrid,
  initialClusterName,
  askClusterName,
}: CommandDialogProps) {
  const [clusterName, setClusterName] = React.useState(initialClusterName);
  const [driver, setDriver] = React.useState('');

  const history = useHistory();

  if (acting && open && !running) {
    if (askClusterName) {
      return <Loader title={`Loading data for ${title}`} />;
    } else {
      return null;
    }
  }

  const content = (
    <>
      {!askClusterName && !acting && (
        <Typography>
          {`Are you sure you want to "${command}" the cluster "${clusterName}"?`}
        </Typography>
      )}

      {askClusterName && !acting && (
        <>
          <FormControl fullWidth>
            <Box pt={2}>
              <TextField
                id="cluster-name-input"
                label="Cluster Name"
                value={clusterName}
                onChange={function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
                  setClusterName(event.target.value);
                }}
                variant="outlined"
              />
            </Box>
          </FormControl>
          <DriverSelect driver={driver} setDriver={setDriver} />
        </>
      )}
      {acting && actingLines && Array.isArray(actingLines) && actingLines.length > 0 && (
        <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
          {actingLines.map((line, index) => (
            <Typography key={index} variant="body1">
              {line}
            </Typography>
          ))}
        </Card>
      )}
      {running && !commandDone && <Loader title={`Loading data for ${title}`} />}
    </>
  );

  const buttons = (
    <>
      {!acting && (
        <>
          {!useGrid && <Button onClick={onClose}>Cancel</Button>}
          <Button
            onClick={() => {
              if (clusterName) {
                onConfirm({ clusterName, driver });
              }
            }}
            variant="contained"
            color="primary"
          >
            {`${command}`}
          </Button>
        </>
      )}
      {!useGrid && commandDone && (
        <>
          <Button variant="contained" color="primary" onClick={onClose}>
            Close
          </Button>
        </>
      )}
      {useGrid && commandDone && (
        // Going to the doesn't work, because of a bug in the way clusters are only
        // refreshed on the home page. So we can't navigate to the cluster page, as it is a 404.
        // <>
        //   <Button onClick={() => {
        //     onClose();
        //     history.push(`/clusters/${clusterName}`);
        //   }}>View Cluster</Button>
        // </>
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onClose();
              history.push(`/`);
            }}
          >
            Home
          </Button>
        </>
      )}
    </>
  );

  return useGrid ? (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography>{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        {content}
      </Grid>
      <Grid item xs={6}>
        {buttons}
      </Grid>
    </Grid>
  ) : (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>{buttons}</DialogActions>
    </Dialog>
  );
}
