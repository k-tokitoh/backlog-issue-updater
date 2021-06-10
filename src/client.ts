import fetch from "node-fetch";
import { URLSearchParams } from "url";

export type Issue = {
  id: number;
  projectId: number;
  issueKey: string;
  issueType: {
    id: number;
    name: string;
  };
  summary: string;
  status: Status;
  assignee: Asignee;
  parentIssueId: number | null;
  createdUser: User;
  updatedUser?: User;
  created: string;
  customFields: CustomField[];
};

type Status = {
  id: number;
  name: string;
};

type User = {
  name: string;
  mailAddress: string;
};

type Asignee = {
  name: string;
} | null;

type CustomField = {
  id: number;
  name: string;
  value: { id: number; name: string } | number | null;
};

type GetIssueParams = {
  urlParams: {
    issueIdOrKey: number | string;
  };
};

type GetIssueResponse = Issue;

type GetCustomFieldsParams = {
  urlParams: {
    projectIdOrKey: string;
  };
};

type GetCustomFieldsResponse = Array<{
  id: number;
  name: string;
  items: { id: number; name: string }[];
}>;

type GetStatusesParams = {
  urlParams: {
    projectIdOrKey: string;
  };
};

type GetStatusesResponse = Array<Status>;

type PatchIssueParams = {
  urlParams: {
    issueIdOrKey: string;
  };
  requestParams: {
    // 'customField_{id}'をtypeによって表現できないため
    [key in string]: string | number;
  };
};

type PatchIssueResponse = {
  status: {
    name: string;
  };
};

type FetchParams = {
  method: "GET" | "PATCH";
  path: string;
  queryParams?: object;
  requestParams?: { [key in string]: string | number };
  contentType: "application/json" | "application/x-www-form-urlencoded";
};

export default class Client {
  private host: string;
  private apiKey: string;

  constructor(host: string, apiKey: string) {
    this.host = host;
    this.apiKey = apiKey;
  }

  public getIssue: (params: GetIssueParams) => Promise<GetIssueResponse> =
    async ({ urlParams: { issueIdOrKey } }) => {
      const body = await this.fetch({
        method: "GET",
        path: `/issues/${issueIdOrKey}`,
        contentType: "application/json",
      });
      return body as GetIssueResponse;
    };

  public getCustomFields: (
    params: GetCustomFieldsParams
  ) => Promise<GetCustomFieldsResponse> = async ({
    urlParams: { projectIdOrKey },
  }) => {
    const body = await this.fetch({
      method: "GET",
      path: `/projects/${projectIdOrKey}/customFields`,
      contentType: "application/json",
    });
    return body as GetCustomFieldsResponse;
  };

  public getStatuses: (
    params: GetStatusesParams
  ) => Promise<GetStatusesResponse> = async ({
    urlParams: { projectIdOrKey },
  }) => {
    const body = await this.fetch({
      method: "GET",
      path: `/projects/${projectIdOrKey}/statuses`,
      contentType: "application/json",
    });
    return body as GetStatusesResponse;
  };

  public patchIssue: (params: PatchIssueParams) => Promise<PatchIssueResponse> =
    async ({ urlParams: { issueIdOrKey }, requestParams }) => {
      const body = await this.fetch({
        method: "PATCH",
        path: `/issues/${issueIdOrKey}`,
        requestParams: requestParams,
        contentType: "application/x-www-form-urlencoded",
      });
      return body as GetIssueResponse;
    };

  private fetch: (params: FetchParams) => Promise<object> = async ({
    method,
    path,
    queryParams,
    requestParams,
    contentType,
  }) => {
    const body = (() => {
      switch (contentType) {
        case "application/json":
          return JSON.stringify(requestParams);
        case "application/x-www-form-urlencoded":
          if (!requestParams) return;
          const encodedRequestParams = new URLSearchParams();
          Object.keys(requestParams).forEach((key) =>
            encodedRequestParams.append(key, String(requestParams[key]))
          );
          return encodedRequestParams;
      }
    })();

    const query = Object.entries({ apiKey: this.apiKey, ...queryParams })
      .map((e) => e.join("="))
      .join("&");

    const res = await fetch(`${this.host}${path}?${query}`, {
      method: method,
      body: body,
      headers: { "Content-Type": contentType },
    });

    return await res.json();
  };
}
