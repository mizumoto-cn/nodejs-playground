"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bigquery_1 = require("@google-cloud/bigquery");
const bigquery = new bigquery_1.BigQuery({ location: 'asia-northeast1' });
const dataset_id = process.env.DATASET_ID;
const table_id = process.env.TABLE_ID;
const dest_dataset = process.env.DEST_DATASET;
const dest_table = process.env.DEST_TABLE;
const project_id = process.env.PROJECT_ID;
const fetchMetadata = async () => {
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
const fieldToRow = (id, field, childIds) => {
    return {
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
};
const rowInsertQuery = async (row) => {
    const query = `INSERT INTO \`${project_id}.${dest_dataset}.${dest_table}\` VALUES (${row.ID}, '${row.Name}', '${row.Description}', '${row.Mode}', '${row.Type}', '${row.PolicyTags}', '${row.ChildSchema}', '${row.MaxLength}', '${row.Precision}', '${row.Scale}', '${row.DefaultValueExpression}', '${row.Collation}');`;
    return query;
};
const insertLine = async (field, id, childIds) => {
    const row = fieldToRow(id, field, childIds);
    if (!dest_dataset || !dest_table) {
        console.log('Missing destination dataset or table id');
        return;
    }
    const destTable = bigquery.dataset(dest_dataset).table(dest_table);
    // console.log(row);
    // await destTable.insert([row], {
    //   skipInvalidRows: true,
    //   ignoreUnknownValues: true,
    //   raw: true,
    // });
    destTable.query(await rowInsertQuery(row));
};
const formQuery = async (fields, parentId) => {
    let allChildrenCount = 0;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].fields) {
            const childIds = [];
            for (let j = 0; j < fields[i].fields.length; j++) {
                childIds.push(parentId + allChildrenCount + i + j + 2);
            }
            await insertLine(fields[i], parentId + allChildrenCount + i + 1, childIds);
            await formQuery(fields[i].fields, parentId + allChildrenCount + i + 1);
            allChildrenCount += fields[i].fields.length;
        }
        else {
            await insertLine(fields[i], parentId + allChildrenCount + i + 1, []);
        }
    }
};
const insertBI = async () => {
    formQuery((await fetchMetadata()).fields, 0);
};
exports.fetchSchema = async (event, context) => {
    // DELETE ALL ROWS FROM destTable
    // DELETE FROM `project.dataset.table` WHERE true;
    await flushTable();
    // printSchema();
    await insertBI();
    return 1;
};
//# sourceMappingURL=index.js.map