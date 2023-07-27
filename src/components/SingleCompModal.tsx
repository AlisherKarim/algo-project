import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { Card, CardContent, Checkbox, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const NestedModal: React.FC<{node: any}> = ({node}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {node.component.parameters.length == 0 ? 
        <></> 
        :
        <IconButton aria-label="edit" onClick={handleOpen}>
          <EditIcon />
        </IconButton>
      }
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Card sx={{ ...style, width: 800 }}>
          <CardContent>
            <>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {node.component?.component_name}
              </Typography>

              {Object.keys(node.parameters).map((param: any) => (
                <Paper variant="outlined" sx={{paddingLeft: '1rem', paddingRight: '1rem', mt: '0.5rem'}} key={`${node.component.id}/${param}`}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      // justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant='body1' width={300}>
                      {param}
                    </Typography>
                    <Paper variant='outlined' sx={{width: '500px', m: '0.5rem'}}>
                      <List>
                        {Array.from(node.parameters[param]).map((comp: any) => (
                          <ListItem
                            key={comp.component.id}
                            secondaryAction={
                              <NestedModal node={comp}/>
                            }
                            disablePadding
                          >
                            <ListItemButton role={undefined} dense>
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  // checked={checked.indexOf(value) !== -1}
                                  tabIndex={-1}
                                  disableRipple
                                  inputProps={{ 'aria-labelledby': comp.component.id }}
                                />
                              </ListItemIcon>
                              <ListItemText id={comp.component.id} primary={comp.component.component_name} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                    
                  </Box>
                </Paper>
              ))}
              {Object.keys(node.parameters).length == 0 && (
                <Typography variant='body2'>This components does not have any parameters</Typography>
              )}
            </>
          </CardContent>
        </Card>
      </Modal>
    </div>
  );
}

export default NestedModal