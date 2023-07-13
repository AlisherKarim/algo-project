import { FileUploader } from "@/components/FileUploader";
import { NavBar } from "@/components/Navbar";
import { Container } from "@mui/material";
import { withSSRContext } from "aws-amplify";
import Link from "next/link";
import { FC } from "react";

const ContributePage: FC<{authenticated: boolean, username: string}> = ({authenticated, username}) => {
  if(!authenticated) {
    return (
      <>
        <NavBar />
        <Container>
          <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>
            Please, sign in first to contribute
          </div>
          <Link href="/login">Login</Link>
        </Container>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <Container>
        {authenticated && username && 
          <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>
            <FileUploader username={username} title="Component Upload" subtitle="Upload your component code here"/>
          </div>
        }
      </Container>
    </>
  )
}

export async function getServerSideProps(context: { req?: any; res: any; modules?: any[] | undefined; } | undefined) {
  const { Auth } = withSSRContext(context)
  try {
    const user = await Auth.currentAuthenticatedUser()
    return {
      props: {
        authenticated: true,
        username: user.username
      }
    }
  } catch (err) {
    context?.res.writeHead(302, { Location: '/login' })
    context?.res.end()
  }
  return {props: {}}
}

export default ContributePage;