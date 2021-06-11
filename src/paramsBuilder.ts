import Client, { Issue } from "./client";
import { BareInputName, BareInputs } from "./constants";
import { Params } from "./parameterInputs/parameterInput";
import StatusNameInput from "./parameterInputs/statusNameInput";
import CustomFieldsWithItemsInput from "./parameterInputs/customFieldsWithItemsInput";
import CustomFieldsWithoutItemsInput from "./parameterInputs/customFieldsWithoutItemsInput";

const inputClasses: {
  [key in BareInputName]:
    | typeof StatusNameInput
    | typeof CustomFieldsWithItemsInput
    | typeof CustomFieldsWithoutItemsInput;
} = {
  statusName: StatusNameInput,
  customFieldsWithItems: CustomFieldsWithItemsInput,
  customFieldsWithoutItems: CustomFieldsWithoutItemsInput,
};

export default class ParamsBuilder {
  public static execute: (
    bareInputs: BareInputs,
    client: Client,
    issue: Issue
  ) => Promise<Params> = async (bareInputs, client, issue) => {
    const inputs = Object.entries(bareInputs).map(([name, value]) =>
      value ? new inputClasses[name as BareInputName](value) : null
    );

    const paramsArray = await Promise.all(
      inputs.map(async (input) => {
        try {
          if (input) return await input.toParams(client, issue);
        } catch (err) {
          console.error(err.name + ": " + err.message);
        }
      })
    );

    return Object.assign(
      {},
      ...paramsArray.filter((input): input is any => Boolean(input))
    );
  };
}
