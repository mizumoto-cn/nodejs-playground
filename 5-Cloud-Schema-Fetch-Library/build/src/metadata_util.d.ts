export interface IEnv {
    projectId: string;
    datasetId: string;
    tableId: string;
    dest_datasetId: string;
    dest_tableId: string;
}
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
    ID: string;
    Dataset: string;
    Table: string;
    Name: string;
    Description: string | null;
    Mode: string;
    Type: string;
    Fields: string;
    PolicyTags: string | null;
    MaxLength: string | null;
    Precision: string | null;
    Scale: string | null;
    DefaultValueExpression: string | null;
    Collation: string | null;
}
export declare const fetchTableMetadata: (datasetId: string, tableId: string) => Promise<import("@google-cloud/common").MetadataResponse>;
export declare const streamSingleTableSchema: (env: IEnv) => Promise<number>;
export declare const streamWholeProjectSchema: (env: IEnv) => Promise<number>;
