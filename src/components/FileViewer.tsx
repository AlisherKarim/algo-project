import { Box, Skeleton } from "@mui/material"
import { FC } from "react"
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/esm/styles/hljs";

export const FileViewer: FC<{currentFile: string | undefined}> = ({currentFile}) => {
  // TODO: change language according to the file
  return (
    <>
      { 
        currentFile ? 
          <SyntaxHighlighter children={currentFile} language="cpp" style={monokaiSublime} customStyle={{
            width: 500,
            height: 500,
            backgroundColor: '#001E3C',
            color: 'white',
            padding: '10px',
            flexGrow: 1, 
            borderRadius: '5px'
          }} showLineNumbers={true} wrapLines={true} />
        : 
          <Skeleton variant="rectangular" width={500} height={500} animation={false} style={{flexGrow: 1, borderRadius: '5px', backgroundColor: '#001E3C'}} />
      }
    </>
  )
}