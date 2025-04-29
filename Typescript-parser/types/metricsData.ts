import {Resource_bucket} from './logEntry'

export interface MetricsData {
    // success: boolean;
    failed_resources: {resource_name: string, resource_type: string}[];
    applied_resources: Resource_bucket[];
    created_resources: Resource_bucket[];
    updated_resources: Resource_bucket[];
    deleted_resources: Resource_bucket[];
    summary: string;
    total_time: number;
    error_messages: string[];
    // id: Date;
    // resourceLeadTimeArray: any
  }

  export interface terraformRun{
    success: boolean;
    total_time: number;
    failed_resources: {resource_name: string, resource_type: string}[];
    applied_resources: Resource_bucket[];
  }