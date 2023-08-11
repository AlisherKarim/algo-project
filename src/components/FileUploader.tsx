import { useAuthenticator } from '@aws-amplify/ui-react'
import { v4 as uuidv4 } from "uuid";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { Alert, Box, Button, CircularProgress, IconButton, Link, Modal, Snackbar, TextField, Typography } from "@mui/material"
import FilePresentIcon from '@mui/icons-material/FilePresent';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import JSZip from 'jszip'
import React, { FC, useEffect, useState } from "react"

import { ddbDocClient, PutCommand, ScanCommand } from "../libs/ddbDocClient"; 
import { useRouter } from 'next/router';

export const UploadModal: FC<{
    open: boolean,
    handleClose: () => void,
    handleSnackbar: (v: boolean) => void,
    file: File | undefined,
    storagePath: string,
    manifest: string,
    callBack: () => void
  }> = ({
      open,
      handleClose,
      handleSnackbar,
      file,
      storagePath,
      manifest,
      callBack
    }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [loading, setLoading] = useState<boolean>(false)

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

  const handleSubmit = async () => {
    if (!file || !user.username) 
      return

    setLoading(true)
    var data = new FormData()
    data.append('path', storagePath)
    data.append('username', user.username)
    data.append('user_fullname', user.attributes?.name || '')
    data.append('file', file)
    
    fetch("https://1c2kn07ik5.execute-api.us-east-1.amazonaws.com/unzipAndUpload", {
      method: 'POST',
      body: data,
      mode: 'no-cors',
    }).then(async res => {
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

      setLoading(false);
      if(res.status == 300) {
        setError(await res.json().then(body => body.message))
      } else {
        handleClose()
        callBack()
        handleSnackbar(true)
      }
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

export const FileUploader: FC<{callBack: () => void}> = ({callBack}) => {
  const router = useRouter()
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
        if(!file.name.startsWith('__MACOSX') && file.name.endsWith('.yml'))
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
      <Button color="secondary" size="small" onClick={() => router.reload()}>
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
    <>
      <Snackbar
        open={sOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="File successfully uploaded. Refresh the pafe to see it on the list"
        action={action}
      />
      <UploadModal open={open} handleClose={handleClose} handleSnackbar={setSOpen} file={file} storagePath={`public/components`} manifest={manifest ?? 'Loading...'} callBack={callBack}/>
      <Button variant="contained" component="label" startIcon={<UploadIcon />}>
        Upload
        <input hidden accept=".zip" multiple type="file" onChange={handleInput}/>
      </Button>
    </>
  )
}