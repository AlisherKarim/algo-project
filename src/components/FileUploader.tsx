import { FileUploader as AmplifyUploader} from "@aws-amplify/ui-react"
import { StorageManager } from '@aws-amplify/ui-react-storage'
import { Card, CardContent, Typography } from "@mui/material"
import { FC } from "react"

export const FileUploader: FC<{username: string, folder: string, title: string, subtitle: string}> = ({username, folder, title, subtitle}) => {
  return (
    <Card style={{ width: '18rem' }} variant="outlined">
      <CardContent>
        <div style={{height: "100px"}}>
          <Typography sx={{ fontSize: 20 }} color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {/* <Card.Title className="text-primary">{title}</Card.Title> */}
          <Typography variant="body2" component="div">{subtitle}</Typography>
        </div>
        {/* <Form.Group controlId="formFile" className="mb-3 mt-3" style={{bottom: "5rem"}}>
          <Form.Control type="file" accept=".zip" size="sm" onInput={handleFileInput} />
        </Form.Group> */}
        <StorageManager
          acceptedFileTypes={['.zip']}
          accessLevel="public"
          maxFileCount={1}
          isResumable
          path={`${username}/${folder}/`}
          onUploadStart={(e) => {
            console.log('uploading', e.key)
          }}
        />
      </CardContent>
    </Card>
  )
}