import Client, { Issue } from "../client";

type CustomFieldWithItem = {
  name: string;
  itemName: string;
  upsert?: boolean;
};

export default class CustomFieldsWithItemsInput {
  private value: CustomFieldWithItem[];

  constructor(bareInput: string) {
    this.value = JSON.parse(bareInput);
  }

  public async toParams(client: Client, issue: Issue) {
    const customFieldsToPatch = this.customFieldsToPatch(issue);

    const customFields = await client.getCustomFields({
      urlParams: { projectIdOrKey: String(issue.projectId) },
    });

    return customFieldsToPatch.reduce(
      (accumulator: { [key in string]: number }, field) => {
        const customField = customFields.find((f) => f.name === field.name);
        const key = `customField_${customField?.id}`;
        const itemId = customField?.items.find(
          (item) => item.name === field.itemName
        )?.id;
        if (!itemId) return accumulator;
        accumulator[key] = itemId;
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
