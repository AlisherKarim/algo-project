
import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { Storage } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress } from '@mui/material';

export const FolderView = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [data, setData] = React.useState<{} | null>(null)

  const processStorageList = (response: any) => {
    const filesystem = {__id: 'root', __name: 'root'};
    const add = (source: string, target: { [x: string]: any; }, item: any) => {
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
    response.results.forEach((item: { key: string; }) => add(item.key, filesystem, item));
    return filesystem;
  }

  React.useEffect(() => {
    Storage.list(`${user.username}`) // for listing ALL files without prefix, pass '' instead
      .then((response) => {
        setData(processStorageList(response))
        console.log(data)
      })
      .catch((err) => console.log(err));
  }, [])

  const renderTree = (nodes: any) => {
    if(nodes.__name == user.username) 
      nodes.__name = user.attributes?.name
    const children = Object.keys(nodes).filter((node: any) => !['__name', '__id', '__data'].includes(node))

    return (
      <TreeItem key={nodes.__id} nodeId={nodes.__id} label={nodes.__name}>
        {
          children.length ? 
            children.map((node: any) => renderTree(nodes[node]))
            : null
        }
      </TreeItem>
    )
  }
    

  return (
    <div style={{flexGrow: 1, padding: '10px'}}>
      {data ? 
        <TreeView
          aria-label="rich object"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{ flexGrow: 1, width: 300, overflowY: 'auto' }}
        >
          {renderTree(data)}
        </TreeView>
        :
        <CircularProgress />
      }
    </div>
  );
}