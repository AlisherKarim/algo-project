import { useAuthenticator } from '@aws-amplify/ui-react'
import { v4 as uuidv4 } from "uuid";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { Alert, Box, Button, Card, CardContent, CircularProgress, IconButton, InputLabel, Link, MenuItem, Modal, Select, Snackbar, Typography } from "@mui/material"
import FilePresentIcon from '@mui/icons-material/FilePresent';
import CloseIcon from '@mui/icons-material/Close';
import JSZip from 'jszip'
import React, { FC, useEffect, useState } from "react"

import { ddbDocClient, PutCommand, ScanCommand } from "../libs/ddbDocClient"; 

const UploadModal: FC<{
    open: boolean,
    handleClose: () => void,
    handleSnackbar: (v: boolean) => void,
    file: File | undefined,
    storagePath: string,
    manifest: string
  }> = ({
      open,
      handleClose,
      handleSnackbar,
      file,
      storagePath,
      manifest
    }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [loading, setLoading] = useState<boolean>(false)
  const [componentType, setComponentType] = useState<string>('10')
  const [componentTypes, setComponentTypes] = useState<any[]>([])

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: '5px',
    boxShadow: 24,
    p: 4,
  };

  const [error, setError] = useState<string>()

  useEffect(() => {
    const params = {
      TableName: "Components",
    };
    try {
      ddbDocClient.send(new ScanCommand(params))
        .then(output => {
          if(output.Items) {
            setComponentTypes(output.Items)
            setComponentType(output.Items[0].group_name)
          }
        })
        .catch(err => console.log(err));
    } catch (err: any) {
      console.error("Error", err.stack);
    }
  }, [])

  const handleComponentType = (e: any) => {
    setComponentType(e.target.value)
  }

  const handleSubmit = async () => {
    if (!file || !user.username) 
      return
    setLoading(true)
    var data = new FormData()
    data.append('path', storagePath)
    data.append('file', file)
    // data.append('username', user.username)
    fetch("https://1c2kn07ik5.execute-api.us-east-1.amazonaws.com/unzipAndUpload", {
      method: 'POST',
      body: data,
      mode: 'no-cors',
    }).then(async res => {
      // after successful upload, create a record on "S3UploadRecords"
      const params = {
        TableName: "S3UploadRecords",
        Item: {
          uploadId: uuidv4(),
          fileKey: `${storagePath}/${file.name}`.replace('.zip', ''),
          status: "pending",
          timestamp: new Date().toISOString(),
          userName: user.username,
          type: "upload"
        },
      };
      try {
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - item added or updated", data);
      } catch (err: any) {
        console.error("Error", err.stack);
      }

      const addToComponentParams = {
        TableName: 'Components',
        Item: {
          name: file.name.replace('.zip', ''),
          key: `${storagePath}/${file.name}`.replace('.zip', ''),
        }
      }
      await ddbDocClient.send(new PutCommand(addToComponentParams))
      
      setLoading(false); 
      handleClose()
      handleSnackbar(true)
    }).catch(err => setError("Something went wrong"))
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography id="modal-modal-title" variant="h6" component="h2">
          You are uploading the next file:  <Link underline="none" sx={{display: 'flex', alignItems: 'center'}}><FilePresentIcon sx={{marginBottom: 0}}/> {file?.name}</Link>
        </Typography>
        
        <SyntaxHighlighter language='yaml' style={monokaiSublime} customStyle={{
          height: 500,
          backgroundColor: '#001E3C',
          color: 'white',
          padding: '10px',
          flexGrow: 1, 
          borderRadius: '5px'
        }}>
          {manifest}
        </SyntaxHighlighter>

        {componentTypes.length > 0 && 
          <div>
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={componentType}
              label="Component Type"
              onChange={handleComponentType}
              sx={{
                margin: '1rem 1rem 1rem 0'
              }}
            >
              {componentTypes.map((cType) => (
                <MenuItem value={cType.group_name} key={cType.group_name}>{cType.group_name}</MenuItem>
              ))}
            </Select>
          </div>
        }

        <Button variant='outlined' color='success' onClick={handleSubmit} disabled={loading} > 
          {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>} 
          <span>Approve and submit</span>
        </Button>
        <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading} sx={{left: '1rem'}} > 
          <span>Cancel</span>
        </Button>
      </Box>
    </Modal>
  )
}

export const FileUploader: FC<{username: string, title: string, subtitle: string}> = ({username, title, subtitle}) => {
  const [file, setFile] = useState<File>()
  const [manifest, setManifest] = useState<string | null>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [sOpen, setSOpen] = useState<boolean>(false)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0])
    const file = e.target.files![0];
    const reader = new FileReader();

    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const data = event.target!.result as ArrayBuffer;
      const zip = await JSZip.loadAsync(data);
      // Access the files inside the zip using the file() function
      const files = zip.file(/.*/);
      // Do something with the files, such as logging their names
      files.forEach(async (file) => {
        if(file.name.endsWith('BubbleSortAlgm.yml'))
          setManifest(await file.async("text"))
      });
    };

    reader.readAsArrayBuffer(file);

    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSnackbarClose = () => {
    setSOpen(false)
  }

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleSnackbarClose}>
        Done
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <>
      <Snackbar
        open={sOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="File successfully uploaded"
        action={action}
      />
      <UploadModal open={open} handleClose={handleClose} handleSnackbar={setSOpen} file={file} storagePath={`public/components`} manifest={manifest ?? 'Loading...'}/>
      <Card style={{ width: '18rem' }} variant="outlined">
        <CardContent>
          <div style={{height: "100px"}}>
            <Typography sx={{ fontSize: 20 }} color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" component="div">{subtitle}</Typography>
          </div>
          <div>
            <Button variant="contained" component="label">
              Upload
              <input hidden accept=".zip" multiple type="file" onChange={handleInput}/>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}