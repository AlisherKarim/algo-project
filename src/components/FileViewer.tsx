import { Skeleton } from "@mui/material"

export const FileViewer = () => {
  return (
    <>
      <Skeleton variant="rectangular" width={500} height={500} animation={false} style={{flexGrow: 1, borderRadius: '5px'}} />
    </>
  )
}