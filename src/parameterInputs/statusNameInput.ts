import Client, { Issue } from "../client";
import ParameterInput from "./parameterInput";

export default class StatusNameInput extends ParameterInput {
  private value: string;

  constructor(bareInput: string) {
    super();
    this.value = bareInput;
  }

  public async toParams(client: Client, issue: Issue) {
    const statuses = await client.getStatuses({
      urlParams: { projectIdOrKey: String(issue.projectId) },
    });

    const status = statuses.find((status) => status.name === this.value);

    if (!status)
      throw new Error(`status "${this.value}" is queried, but not found.`);

    return { statusId: status.id };
  }
}
