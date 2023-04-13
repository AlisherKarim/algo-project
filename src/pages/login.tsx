import { withAuthenticator } from "@aws-amplify/ui-react";
import { Authenticator } from '@aws-amplify/ui-react';
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";

const NavigateToMain = () => {
  const router = useRouter()
  useEffect(() => {
    router.push("/")
  }, [])

  return <>Navigation</>
}

const LoginPage: FC = () => {
  return (
    <div style={{marginTop: "3rem"}}>
      <Authenticator>
        <NavigateToMain />
      </Authenticator>
    </div>
  );
}

export default LoginPage;