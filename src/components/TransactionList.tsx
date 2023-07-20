import { Badge, Button, CircularProgress, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Snackbar } from "@mui/material"
import FolderIcon from '@mui/icons-material/Folder';
import { FC, useEffect, useState } from "react";
import { Auth, Storage } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { Component, ITransaction } from "@/types";
import { useRouter } from 'next/router'

const ITEM_HEIGHT = 24;

const CustomMenu: FC<{path: string, name: string, component: Component}> = ({path, name, component}) => {
  const router = useRouter()
  const [sOpen, setSOpen] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async () => {
    setAnchorEl(null);
  }
  const handleMakePublic = async () => {
    await fetch('https://ersss5rh04.execute-api.us-east-1.amazonaws.com/default/editComponentByID', {
      method: 'POST',
      body: JSON.stringify({'id': component.id,'is_public': !component.is_public})
    })
    setAnchorEl(null)
    setSOpen(true)
  };

  const handleSnackbarClose = () => {
    setSOpen(false)
  }

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={() => {router.reload()}}>
        Refresh
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={sOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Successfully updated! Refresh the page"
        action={action}
      />
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleMakePublic}>
          {component.is_public ? 'Make private' : 'Make public'}
        </MenuItem>
      </Menu>
    </div>
  );
}

export const TransactionList: FC<{setKeyPath: (path: string) => void, userComponents: Component[]}> = ({setKeyPath, userComponents}) => {
  const [transactionList, setTransactions] = useState<ITransaction[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const [selectedKey, setSelected] = useState<string>()

  const createTransactionsList = () => {
    const transactions: ITransaction[] = []
    userComponents.forEach((transaction: Component) => {
      const temp = transaction.s3_key.split('/')
      temp.shift()
      const newTransaction = {key: temp.join('/'), name: transaction.component_name, component: transaction}
      transactions.push(newTransaction)
    })
    setTransactions(transactions)
  }

  useEffect(() => {
    setLoading(true)
    createTransactionsList()
    setLoading(false)
  }, [])

  return (
    <List
      sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}
      subheader={<ListSubheader>Transactions</ListSubheader>}
    >
      <Divider />

      {isLoading ? 
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <CircularProgress />
        </div>
        :
        transactionList.map(t => (
          <div key={t.component.id}>
            <ListItemButton selected={selectedKey === t.component.id} onClick={() => {
              setSelected(t.component.id)
              setKeyPath(t.key)
            }}>
              <ListItemIcon>
                {t.component.is_public ? (
                  <Badge badgeContent={'Public'} color="primary">
                    <FolderIcon color="action" />
                  </Badge>
                ) : (
                  <FolderIcon />
                  )
                }
              </ListItemIcon>
              <ListItemText id="switch-list-label-wifi" primary={t.name}/>
              <ListItemIcon style={{justifyContent: 'end'}}>
                <CustomMenu path={t.key} name={t.name} component={t.component}/>
              </ListItemIcon>
            </ListItemButton>
            <Divider />
          </div>
        )
      )}
      
    </List>
  )
}