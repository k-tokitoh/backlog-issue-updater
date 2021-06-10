import Client, { Issue } from "../client";

type CustomFieldWithoutItem = {
  name: string;
  value: string;
  upsert?: boolean;
};

export default class CustomFieldsWithoutItemsInput {
  private value: CustomFieldWithoutItem[];

  constructor(bareInput: string) {
    this.value = JSON.parse(bareInput);
  }

  public async toParams(client: Client, issue: Issue) {
    const valuesToPatch = this.customFieldsToPatch(issue);

    const customFields = await client.getCustomFields({
      urlParams: { projectIdOrKey: String(issue.projectId) },
    });

    return valuesToPatch.reduce(
      (accumulator: { [key in string]: string }, field) => {
        const id = customFields.find((f) => f.name === field.name)?.id;
        const key = `customField_${id}`;
        accumulator[key] = field.value;
        return accumulator;
      },
      {}
    );
  }

  private customFieldsToPatch(issue: Issue) {
    return this.value.filter((field) => {
      if (typeof field.upsert === "undefined") field.upsert = true;
      return (
        field.upsert ||
        !issue.customFields.find((f) => f.name === field.name)?.value
      );
    });
  }
}
