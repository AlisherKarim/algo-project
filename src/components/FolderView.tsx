
import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

interface RenderTree {
  id: string;
  name: string;
  children?: readonly RenderTree[];
}

const data: RenderTree = {
  id: 'root',
  name: 'username',
  children: [
    {
      id: '10',
      name: 'Algorithms',
      children: [
        {
          id: '101',
          name: 'algo.cpp'
        }
      ]
    },
    {
      id: '11',
      name: 'Data Structures',
      children: [
        {
          id: '4',
          name: 'ds.cpp',
        },
      ],
    },
    {
      id: '12',
      name: 'Test Generators',
      children: [
        {
          id: '121',
          name: 'test.dat'
        }
      ]
    },
    {
      id: '13',
      name: 'Data Set',
      children: [
        {
          id: '131',
          name: 'data.dat'
        }
      ]
    },
  ],
};

export const FolderView = () => {
  const renderTree = (nodes: RenderTree) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <div style={{flexGrow: 1, padding: '10px'}}>
      <TreeView
        aria-label="rich object"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      >
        {renderTree(data)}
      </TreeView>
    </div>
  );
}