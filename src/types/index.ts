export interface User {
  attributes: {
    name: string
  }
}

export interface Component {
  id: string,
  component_name: string,
  created_by: string,
  s3_key: string,
  parameters: string[],
  is_public: boolean,
  keywords: string[]
}

export interface RegisteredComponent {
  component_id: string,
  registered_by: string[]
}

export interface ITransaction {
  key: string,
  name: string,
  component: Component
}

export interface IAlert {
  title: string,
  severity: string,
  text: string
}

export interface IContext {
  isLoading: boolean,
  setLoading: (_: boolean) => void,
  alertMessage: IAlert,
  setAlertMessage: (_: IAlert) => void
}