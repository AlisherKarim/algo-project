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
  is_public: boolean
}

export interface ITransaction {
  key: string,
  name: string,
  component: Component
}