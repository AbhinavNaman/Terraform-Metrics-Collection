//internal imports
import { LogEntry, Resource_bucket } from "../types/logEntry.js";
import { MetricsData, terraformRun } from "../types/metricsData.js";
import { addMetrics } from "../DB/addMetrics.js";
import { consoleData } from "../consoles/console.js";
import { sendSlackNotification } from "../notification/slack.js";

export async function logParserFunc(logs: LogEntry[]): Promise<void> {
  const resourceMap = new Map();
  let success = true;

  const failed_resources: {resource_name: string, resource_type: string}[] = [];
  const created_resources: Resource_bucket[] = [];
  const updated_resources: Resource_bucket[] = [];
  const deleted_resources: Resource_bucket[] = [];
  const error_messages: string[] = [];
  let summary: string = "No summary available";
  const firstTimestamp = logs[0]?.["@timestamp"];
  const lastTimestamp = logs[logs.length - 1]?.["@timestamp"];

  for (const log of logs) {
    const type = log.type;
    const level = log["@level"];
    const message = log["@message"];


    if (type === "apply_start") {
      const resource_name = log?.hook?.resource?.resource;
      var resourceObj = {
        resource: log?.hook?.resource?.resource_type,
        resource_name: log?.hook?.resource?.resource,
        resource_apply_start_time: new Date(log["@timestamp"]).getTime(),
        resource_apply_complete_time: 0,
        resource_total_lead_time: 0
      }
      resourceMap.set(resource_name, resourceObj);
    }

    if (type === "apply_complete") {
      const resource_name = log?.hook?.resource?.resource;
      const resourceObj2 = resourceMap.get(resource_name);

      resourceObj2.resource_apply_complete_time = new Date(log["@timestamp"]).getTime();
      const total_lead_time = Math.floor((resourceObj2.resource_apply_complete_time - resourceObj2.resource_apply_start_time) / 1000);
      resourceObj2.resource_total_lead_time = total_lead_time;
      resourceMap.set(resource_name, resourceObj2);


      const action = log?.hook?.action;
      const resource_type = log?.hook?.resource?.resource_type;

      if (action === "create" && resource_type){ 
        const obj = {
          resource_name,
          resource_type,
          total_lead_time
        }
        created_resources.push(obj);
      }
      else if (action === "update" && resource_type){ 
        const obj = {
          resource_name,
          resource_type,
          total_lead_time
        }
        updated_resources.push(obj);
      }
      else if (action === "delete" && resource_type){
        const obj = {
          resource_name,
          resource_type,
          total_lead_time
        }
        deleted_resources.push(obj);
      }
    }

    if (type === "apply_errored") {
      success = false;
      const resource_type = log?.hook?.resource?.resource_type;
      const resource_name = log?.hook?.resource?.resource_name;
      if (resource_type) failed_resources.push({resource_name, resource_type});
    }

    if (type === "change_summary" && message) {
      summary = message;
    }

    if (level === "error" && message) {
      success = false;
      error_messages.push(message);
    }
  }

  const applied_resources: Resource_bucket[] = [
    ...created_resources,
    ...updated_resources,
    ...deleted_resources,
  ];

  let total_time = 0;
  if (firstTimestamp && lastTimestamp) {
    const start = new Date(firstTimestamp).getTime();
    const end = new Date(lastTimestamp).getTime();
    total_time = Math.floor((end - start) / 1000);
  }

  const id = new Date();

  const data: MetricsData = {
    failed_resources, applied_resources, created_resources, updated_resources, deleted_resources, summary, total_time, error_messages,
  }

  const terraformRun_data: terraformRun = {
    success, total_time, applied_resources, failed_resources
  }

  // func1: console the result on the terminal
  consoleData(data); 
  // func2: sends slack notification if terraform apply fails
  if(error_messages.length >0 )sendSlackNotification(error_messages); 
  // func3: adds the extracted data from the logs to postgresDB
  addMetrics(terraformRun_data, created_resources, updated_resources, deleted_resources, error_messages); 
}