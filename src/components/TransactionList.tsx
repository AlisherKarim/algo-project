import { CircularProgress, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import FolderIcon from '@mui/icons-material/Folder';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LockIcon from '@mui/icons-material/Lock';
import { FC, useEffect, useState } from "react";
import { Storage } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";

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
        const newTransaction = {key: `${structure?.[0]}/${structure?.[1]}/${structure?.[2]}`, tag: `${structure?.[1]}`, name: `${structure?.[2]}`}
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
                <LockIcon color="success"/>
              </ListItemIcon>
            </ListItemButton>
            <Divider />
          </div>
        )
      )}
      
    </List>
  )
}