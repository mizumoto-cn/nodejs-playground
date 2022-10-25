import {BigQuery} from '@google-cloud/bigquery';
const bigquery = new BigQuery();

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
  const options = {
    query: `DELETE FROM \`${project_id}.${dest_dataset}.${dest_table}\` WHERE true;`,
    location: 'asia-northeast1',
  };
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);
};
// const printSchema = async () => {
//   const schema = await fetchMetadata();
//   // console.log(schema);
//   console.log(JSON.stringify(schema));
// };

const insertLine = async (field: IField, id: number, childIds: number[]) => {
  const row = {
    ID: id,
    Name: field.name,
    Description: field.description,
    Mode: field.mode,
    Type: field.type,
    PolicyTags: field.policyTags,
    ChildSchema: childIds,
    MaxLength: field.maxLength,
    Precision: field.precision,
    Scale: field.scale,
    DefaultValueExpression: field.defaultValueExpression,
    Collation: field.collation,
  };
  if (!dest_dataset || !dest_table) {
    throw new Error('Missing destination dataset or table id');
  }
  const destTable = bigquery.dataset(dest_dataset).table(dest_table);
  await destTable.insert(row);
  console.log(row);
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
  if (!dest_dataset || !dest_table || !project_id) {
    throw new Error('Missing destination project, dataset or table id');
  }
  // DELETE ALL ROWS FROM destTable
  // DELETE FROM `project.dataset.table` WHERE true;
  flushTable();
  // printSchema();
  await insertBI();
  return 1;
};
