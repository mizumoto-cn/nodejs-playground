import {BigQuery} from '@google-cloud/bigquery';
const bigquery = new BigQuery({location: 'asia-northeast1'});

const dataset_id = process.env.DATASET_ID;
const table_id = process.env.TABLE_ID;
const dest_dataset = process.env.DEST_DATASET;
const dest_table = process.env.DEST_TABLE;
const project_id = process.env.PROJECT_ID;
// const schemaQueue = [];

// interface IPolicyTag {
//   name: string;
// }

interface IField {
  name: string;
  description: string | null;
  mode: string;
  type: string;
  fields: IField[];
  policyTags: string | null;
  maxLength: string | null;
  precision: string | null;
  scale: string | null;
  collation: string | null;
  defaultValueExpression: string | null;
}

interface ISchema {
  fields: IField[];
}

interface IRow {
  ID: number;
  Name: string;
  Description: string;
  Mode: string;
  Type: string;
  PolicyTags: string;
  ChildSchema: string;
  MaxLength: string;
  Precision: string;
  Scale: string;
  DefaultValueExpression: string;
  Collation: string;
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

const flushTable = async () => {
  const query = `DELETE FROM \`${project_id}.${dest_dataset}.${dest_table}\` WHERE true;`;
  await bigquery.createQueryJob(query);
};
// const printSchema = async () => {
//   const schema = await fetchMetadata();
//   // console.log(schema);
//   console.log(JSON.stringify(schema));
// };

const insertLine = async (field: IField, id: number, childIds: number[]) => {
  const row: IRow = {
    ID: id,
    Name: field.name,
    Description: field.description || '',
    Mode: field.mode,
    Type: field.type,
    PolicyTags: JSON.stringify(field.policyTags) || '',
    ChildSchema: childIds.toString(),
    MaxLength: field.maxLength || '',
    Precision: field.precision || '',
    Scale: field.scale || '',
    DefaultValueExpression: field.defaultValueExpression || '',
    Collation: field.collation || '',
  };
  if (!dest_dataset || !dest_table) {
    console.log('Missing destination dataset or table id');
    return;
  }
  const destTable = bigquery.dataset(dest_dataset).table(dest_table);
  console.log(row);
  await destTable.insert([row], {
    skipInvalidRows: true,
    ignoreUnknownValues: true,
    raw: true,
  });
};

const formQuery = async (fields: IField[], parentId: number) => {
  let allChildrenCount = 0;
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].fields) {
      const childIds = [];
      for (let j = 0; j < fields[i].fields.length; j++) {
        childIds.push(parentId + allChildrenCount + i + j + 2);
      }
      await insertLine(
        fields[i],
        parentId + allChildrenCount + i + 1,
        childIds
      );
      await formQuery(fields[i].fields, parentId + allChildrenCount + i + 1);
      allChildrenCount += fields[i].fields.length;
    } else {
      await insertLine(fields[i], parentId + allChildrenCount + i + 1, []);
    }
  }
};

const insertBI = async () => {
  formQuery((await fetchMetadata()).fields, 0);
};

exports.fetchSchema = async (event: never, context: never): Promise<number> => {
  // DELETE ALL ROWS FROM destTable
  // DELETE FROM `project.dataset.table` WHERE true;
  await flushTable();
  // printSchema();
  await insertBI();
  return 1;
};
