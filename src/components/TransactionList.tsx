import { CircularProgress, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import FolderIcon from '@mui/icons-material/Folder';
import { FC, useEffect, useState } from "react";
import { Storage } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const options = [
  'make public',
];

const ITEM_HEIGHT = 24;

const CustomMenu: FC<{path: string, name: string}> = ({path, name}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async () => {
    setAnchorEl(null);
  }
  const handleMakePublic = async () => {
    const destinationFolder = 'public_folder/algorithms/';
    await Storage.list(path).then((res) => {
      res.results.forEach(result => {
        console.log(result.key?.replace(path, destinationFolder + name))
        if(result.key) {
          Storage.copy({key: result.key}, {key: result.key?.replace(path, destinationFolder + name)})
          // Storage.remove(result.key)
        }
      })
    });

    await Storage.list(path).then((res) => {
      res.results.forEach(result => {
        console.log(result.key?.replace(path, destinationFolder + name))
        if(result.key) {
          // Storage.copy({key: result.key}, {key: result.key?.replace(path, destinationFolder + '/' + name)})
          Storage.remove(result.key)
        }
      })
    });
  };

  return (
    <div>
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
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} onClick={handleMakePublic}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

interface ITransaction {
  key: string,
  tag: string,
  name: string
}

export const TransactionList: FC<{setKeyPath: (path: string) => void}> = ({setKeyPath}) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [transactionList, setTransactions] = useState<ITransaction[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const [selectedKey, setSelected] = useState<string>()

  useEffect(() => {
    const transactions: ITransaction[] = []
    Storage.list(`${user.username}`).then(result => {
      result.results.forEach((res) => {
        const structure = res.key?.split('/');
        console.log(structure)
        const newTransaction = {key: `${structure?.[0]}/${structure?.[1]}`, tag: `${structure?.[1]}`, name: `${structure?.[1]}`}
        if(!transactions.find(t => t.key == newTransaction.key))
          transactions.push(newTransaction)
      })
      setLoading(false)
      setTransactions(transactions)
    }).catch(err => {
      console.error(err)
    })
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
          <div key={t.key}>
            <ListItemButton selected={selectedKey === t.key} onClick={() => {
              setSelected(t.key)
              setKeyPath(t.key)
            }}>
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText id="switch-list-label-wifi" primary={t.name} secondary={t.tag}/>
              <ListItemIcon style={{justifyContent: 'end'}}>
                <CustomMenu path={t.key} name={t.name}/>
              </ListItemIcon>
            </ListItemButton>
            <Divider />
          </div>
        )
      )}
      
    </List>
  )
}