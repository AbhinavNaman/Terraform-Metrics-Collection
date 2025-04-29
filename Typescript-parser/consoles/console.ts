//internal imports
import {MetricsData} from "../types/metricsData.js"

export const consoleData =({
  failed_resources,
  applied_resources,
  created_resources, 
  updated_resources, 
  deleted_resources, 
  summary, 
  total_time, 
  error_messages
}: MetricsData)=>{


  console.log(" ")
  if (summary) {
    console.error("Summary:");
    console.table([summary]);
  }
  console.log(" ")
  if (failed_resources.length >0) {
    console.error("Failed resources:");
    console.table(failed_resources)
  }
  console.log(" ")
  if (applied_resources.length >0) {
    console.log("successful applied resources: ")
    console.table(applied_resources)
  }
  console.log(" ")
  if (created_resources.length >0) {
    console.log("Successful created Resources:");
    console.table(created_resources);
  }
  console.log(" ")
  if (updated_resources.length >0) {
    console.log("Updated Resources:");
    console.table(updated_resources)
  }
  console.log(" ")
  if (deleted_resources.length >0) {
    console.warn("Deleted Resources:");
    console.table(deleted_resources)
  }
  console.log(" ")
  console.log(`total time: ${total_time} sec`);
  
  console.log(" ")
  if (error_messages.length >0) {
    console.error("Error Messages:");
    console.table(error_messages);
  }
  console.log(" ")
}