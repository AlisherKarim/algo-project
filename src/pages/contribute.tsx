import { FileUploader } from "@/components/FileUploader";
import { NavBar } from "@/components/Navbar";
import { SubmitModal } from "@/components/SubmitModal";
import { useAuthenticator, withAuthenticator } from "@aws-amplify/ui-react";
import { Button, Container } from "@mui/material";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { FormEvent } from "react";

const ContributePage: FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter()

  useEffect(() => {
    console.log(user)
    Auth.currentAuthenticatedUser().then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
      router.push('/login')
    })
  }, [])

  const [file, setFile] = useState<File>()
  const [show, setShow] = useState<boolean>(false)

  // const { user, signOut } = useAuthenticator((context) => [context.user])

  const handleFileInput = (event: FormEvent) => {
    setFile((event.target as HTMLInputElement)?.files?.[0])
  }

  const handleSubmitButton = () => {
    setShow(true)
  }

  return (
    <>
      <NavBar />
      <Container>
        {user.username &&
          <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>

            {/* <FileUploader username={user.username} folder={'data_structures'} title="Data Strucure" subtitle="Upload your data structure code"/> */}
            <FileUploader username={user.username} folder={'algorithms'} title="Algorithm" subtitle="Upload your algorithm code"/>
            <FileUploader username={user.username} folder={'problem_generators'} title="Problem generator" subtitle="Upload your problem generator code"/>
            <FileUploader username={user.username} folder={'data_sets'} title="Data Set" subtitle="Upload your data set"/>

          </div>
        }
        <div style={{marginTop: "3rem", display: "flex", justifyContent: "flex-end"}}>
          <Button onClick={handleSubmitButton}>Submit</Button>
        </div>
      </Container>
    </>
  )
}

export default ContributePage;