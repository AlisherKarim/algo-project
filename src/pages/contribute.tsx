import { FileUploader } from "@/components/FileUploader";
import { SubmitModal } from "@/components/SubmitModal";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Button, Container } from "@mui/material";
import { FC, useState } from "react";
import { FormEvent } from "react";

const ContributePage: FC<{user: any, signOut: any}> = ({user, signOut}) => {

  const [file, setFile] = useState<File>()
  const [show, setShow] = useState<boolean>(false)

  const handleFileInput = (event: FormEvent) => {
    setFile((event.target as HTMLInputElement)?.files?.[0])
  }

  const handleSubmitButton = () => {
    setShow(true)
  }

  return (
    <> 
      {/* <SubmitModal show={show} setShow={setShow}/> */}
      <Container>
        <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>

          <FileUploader username={user.username} folder={'data_structures'} title="Data Strucure" subtitle="Upload your data structure code"/>
          <FileUploader username={user.username} folder={'algorithms'} title="Algorithm" subtitle="Upload your algorithm code"/>
          <FileUploader username={user.username} folder={'problem_generators'} title="Problem generator" subtitle="Upload your problem generator code"/>
          <FileUploader username={user.username} folder={'data_sets'} title="Data Set" subtitle="Upload your data set"/>

        </div>
        <div style={{marginTop: "3rem", display: "flex", justifyContent: "flex-end"}}>
          <Button onClick={handleSubmitButton}>Submit</Button>
        </div>
      </Container>
    </>
  )
}

export default withAuthenticator(ContributePage);