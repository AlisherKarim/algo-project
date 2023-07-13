
import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { Storage } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress, Typography } from '@mui/material';

export const FolderView: React.FC<{setCurrentFile: (content: string) => void, keyPath: string | undefined}> = ({setCurrentFile, keyPath}) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [data, setData] = React.useState<{} | null>(null)
  const [isLoading, setLoading] = React.useState<boolean>(false)

  const processStorageList = (response: any) => {
    console.log(response)
    const folder = response.results.map((res: any) => {return {...res, path: res.key.split('/').splice(2).join('/')}})
    console.log(folder)

    const filesystem = {__id: 'root', __name: 'root'};
    const add = (source: string, target: { [x: string]: any; }, item: any) => {
      console.log(source)
      const elements = source.split('/');
      const element = elements.shift();
      if (!element) return; // blank
      target[element] = target[element] || { __data: item, __name: element, __id: uuidv4() }; // element;
      if (elements.length) {
        target[element] =
          typeof target[element] === 'object' ? target[element] : {};
        add(elements.join('/'), target[element], item);
      }
    };
    folder.forEach((item: { path: string; }) => add(item.path, filesystem, item));
    console.log(filesystem)
    return filesystem;
  }

  React.useEffect(() => {
    if(keyPath){
      setLoading(true)
      Storage.list(keyPath)
        .then((response) => {
          console.log(response)
          setData(processStorageList(response))
          setLoading(false)
        })
        .catch((err) => console.log(err));
    }
  }, [keyPath])

  const handleFileOpen = (data: any) => {
    Storage.get(data.key, {download: true}).then((result) => {
      const reader = new FileReader();

      // When the reader has finished loading the blob, convert it to a string
      reader.addEventListener('loadend', (event) => {
        const text = event?.target?.result?.toString();
        if(text)
          setCurrentFile(text)
        else 
          setCurrentFile('Open file to view...')
      });

      // Read the blob as text
      if(result.Body instanceof Blob)
        reader.readAsText(result.Body);
    })
    
  }

  const renderTree = (nodes: any): any => {
    if(nodes.__name == user.username) 
      nodes.__name = user.attributes?.name
    const children = Object.keys(nodes).filter((node: any) => !['__name', '__id', '__data'].includes(node))

    return nodes.__id !== 'root' ? (
      <TreeItem 
        key={nodes.__id}
        nodeId={nodes.__id}
        label={
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <span>{nodes.__name}</span>
            {/* {(children.length && (nodes.__name !== user.username))&& <Chip label={'Unpublished'} variant="outlined" size="small" />} */}
          </div>
        }
        onClick={() => {
          if(!children.length)
            handleFileOpen(nodes.__data)
        }}
      >
        {
          children.length ? 
            children.map((node: any) => renderTree(nodes[node]))
            : null
        }
      </TreeItem>
    ) : (
      children.length ? 
        children.map((node: any) => renderTree(nodes[node]))
        : null
    )
  }
    

  return (
    <div style={{
      padding: '10px',
      height: '100%'
    }}>
      {data ? isLoading ? 
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <CircularProgress />
        </div>
        :
        <TreeView
          aria-label="rich object"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{ flexGrow: 1, overflowY: 'auto' }}
        >
          {renderTree(data)}
        </TreeView>
        :
        <Typography variant='body2' sx={{color: '#757575'}}>Choose transaction to open</Typography>
      }
    </div>
  );
}