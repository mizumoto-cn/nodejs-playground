export interface ISchema {
  fields: IField[];
}

export interface IField {
  name: string;
  description: string | null;
  mode: string;
  type: string;
  fields: IField[];
  policyTags: string | null;
  maxLength: string | null;
  precision: string | null;
  scale: string | null;
  defaultValueExpression: string | null;
  collation: string | null;
}

export interface IRow {
  ID: number;
  Field: IField;
}
