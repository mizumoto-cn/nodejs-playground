import {BigQuery} from '@google-cloud/bigquery';
const bigquery = new BigQuery();

const dataset_id = process.env.DATASET_ID;
const table_id = process.env.TABLE_ID;
// const dest_dataset = process.env.DEST_DATASET;
// const dest_table = process.env.DEST_TABLE;

// const schemaQueue = [];

// interface IPolicyTag {
//   name: string;
// }

interface IField {
  name: string;
  type: string;
  mode: string;
  fields: IField[];
  // description: string;
  // policyTags: IPolicyTag[];
  // maxLength: number;
  // precision: number;
  // scale: number;
  // collation: string;
  // defaultValueExpression: string;
}

interface ISchema {
  fields: IField[];
}

const fetchMetadata = async (): Promise<ISchema> => {
  if (!dataset_id || !table_id) {
    throw new Error('Missing dataset or table id');
  }
  const dataset = bigquery.dataset(dataset_id);
  const table = dataset.table(table_id);
  const [metadata] = await table.getMetadata();
  const schema = metadata.schema;
  return schema;
};

// const printSchema = async () => {
//   const schema = await fetchMetadata();
//   // console.log(schema);
//   console.log(JSON.stringify(schema));
// };

const insertLine = (field: IField, id: number, childIds: number[]) => {
  // const destTable = bigquery.dataset(dest_dataset).table(dest_table);
  const row = {
    id: id,
    name: field.name,
    type: field.type,
    mode: field.mode,
    fields: childIds,
    // ...
  };
  console.log(row);
  // insert ...
};

const formQuery = (fields: IField[], parentId: number) => {
  let allChildrenCount = 0;
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].fields) {
      const childIds = [];
      for (let j = 0; j < fields[i].fields.length; j++) {
        childIds.push(parentId + allChildrenCount + i + j + 2);
      }
      insertLine(fields[i], parentId + allChildrenCount + i + 1, childIds);
      formQuery(fields[i].fields, parentId + allChildrenCount + i + 1);
      allChildrenCount += fields[i].fields.length;
    } else {
      insertLine(fields[i], parentId + allChildrenCount + i + 1, []);
    }
  }
};

const insertBI = async () => {
  formQuery((await fetchMetadata()).fields, 0);
};

exports.fetchSchema = (event: never, context: never): number => {
  // printSchema();
  insertBI();
  return 1;
};
