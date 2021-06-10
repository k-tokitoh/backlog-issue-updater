import Client, { Issue } from "../client";

export default class StatusNameInput {
  private value: string;

  constructor(bareInput: string) {
    this.value = bareInput;
  }

  public async toParams(client: Client, issue: Issue) {
    const statuses = await client.getStatuses({
      urlParams: { projectIdOrKey: String(issue.projectId) },
    });
    const statusId = statuses.find((status) => status.name === this.value)?.id;

    return { statusId: statusId };
  }
}
