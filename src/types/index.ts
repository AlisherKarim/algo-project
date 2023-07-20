export interface User {
  attributes: {
    name: string
  }
}

export interface Component {
  id: string,
  component_name: string,
  created_by: string,
  parameters: string[]
}