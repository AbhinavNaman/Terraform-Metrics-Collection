//external imports
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg'

//internal imports
import {MetricsData, terraformRun} from "../types/metricsData.js"
import { Resource_bucket } from '../types/logEntry.js';
// import {formatPGArray, formatPGJsonArray} from "../utils/index.js"


const { Client } = pg
const PORT = 5432

const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: PORT,
});

const team = process.env.BRANCH_NAME

//process.env.BRANCH_NAME

// const client = new Client({
//   user: "postgresdb",
//   host: "postgresdb.cnqksm4yy7nf.us-east-1.rds.amazonaws.com",
//   database: "postgresdb",
//   password: "postgresdb",
//   port: 5432,
// });

client.connect()
    .then(() => console.log("PostgreSQL Connected!"))
    .catch((err) => {
        console.error("Cannot connect to PostgreSQL:", err); 
        process.exit(1);
    });

export const addMetrics = async (terraformRun_data: terraformRun, created_resources: Resource_bucket[], updated_resources: Resource_bucket[], deleted_resources: Resource_bucket[], error_messages: string[]): Promise<void> => {
    const terraformRun_uuid: string = uuidv4();
    const time = new Date();
    

    const terraformRun_query = `
    INSERT INTO  terraformRun(
      id, success, timestamp ,total_time, applied_resources, failed_resources, pxt)
      VALUES($1, $2, $3, $4, $5, $6, $7)`;

      //📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌
      const final_failed_resources = terraformRun_data.failed_resources.length > 0 
        ? terraformRun_data.failed_resources.map(resource => `${resource.resource_name}-${resource.resource_type}`).join(', ') 
        : null;

      const terraformRun_value = [
        terraformRun_uuid,
        terraformRun_data.success,
        time,
        terraformRun_data.total_time,
        terraformRun_data.applied_resources,
        final_failed_resources, //📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌
        team
      ]

    const resources_query = `
    INSERT INTO resources(
    id, terraform_run_id, resource_type, resource_name, action, timestamp, total_time)
    VALUES($1, $2, $3, $4, $5, $6, $7)`

    const errors_query = `
    INSERT INTO errors(
    id, terraform_run_id, error_messages, timestamp)
    VALUES($1, $2, $3, $4)`
  
  
    try {
      // inserting into Table 1: terraformRun
      await client.query(terraformRun_query, terraformRun_value);

      // inserting in Table 2: resources
      // helper func for inserting into table 2
      const insert_into_resources = async (resources: Resource_bucket[], action: string ) => {
        for(const val of resources){
          const resource_uuid = uuidv4();
          await client.query(resources_query, [
            resource_uuid,
            terraformRun_uuid,
            val.resource_type,
            val.resource_name,
            action,
            time,
            val.total_lead_time
          ]);
        }
      };

      // function call for insertiing into Table 2
      await insert_into_resources(created_resources, "create");
      await insert_into_resources(updated_resources, "update");
      await insert_into_resources(deleted_resources, "delete");

      // inserting into Table 3: errors
      if(error_messages.length > 0){
        const error_uuid = uuidv4();
        await client.query(errors_query, [
          error_uuid,
          terraformRun_uuid,
          error_messages,
          time
        ]);
      }
  
      console.log("Metrics stored in PostgreSQL");
    } catch (err) {
      console.error("Error inserting metrics:", err);
    }
    finally {
    client.end();
  }
  };