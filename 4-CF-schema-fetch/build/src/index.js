"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bigquery_1 = require("@google-cloud/bigquery");
const bigquery = new bigquery_1.BigQuery();
const dataset_id = process.env.DATASET_ID;
const table_id = process.env.TABLE_ID;
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
// const printSchema = async () => {
//   const schema = await fetchMetadata();
//   // console.log(schema);
//   console.log(JSON.stringify(schema));
// };
const insertLine = (field, id, childIds) => {
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
const formQuery = (fields, parentId) => {
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
        }
        else {
            insertLine(fields[i], parentId + allChildrenCount + i + 1, []);
        }
    }
};
const insertBI = async () => {
    formQuery((await fetchMetadata()).fields, 0);
};
exports.fetchSchema = (event, context) => {
    // printSchema();
    insertBI();
    return 1;
};
//# sourceMappingURL=index.js.map