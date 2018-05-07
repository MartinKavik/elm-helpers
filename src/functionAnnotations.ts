import * as vscode from "vscode";
import { TextDocument, CancellationToken, CodeLens } from "vscode";

export class FunctionAnnotationsProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: TextDocument,
    token: CancellationToken
  ): CodeLens[] | Thenable<CodeLens[]> {
    const sourceCode = document.getText();
    const exposedMembers = getExposedFromSourceCode(sourceCode);
    const lastExposedmember =
      exposedMembers.length > 0
        ? exposedMembers[exposedMembers.length - 1]
        : null;

    const parsedMembers: [number, string][] = [
      ...getTypesFromSourceCode(sourceCode),
      ...getTypeAliasesFromSourceCode(sourceCode),
      ...getFunctionsFromSourceCode(sourceCode)
    ];

    const members: [number, string, [number, string]][] = parsedMembers.map(
      ([index, name]): [number, string, [number, string]] => {
        return [
          index,
          name,
          exposedMembers.find(
            ([_, exposedName]) => exposedName == name || exposedName == ".."
          )
        ];
      }
    );

    const codeLenses = members.map(([index, name, exposedMember]) => {
      const memberNamePosition = document.positionAt(index);

      return new CodeLens(
        new vscode.Range(memberNamePosition, memberNamePosition),
        {
          title: exposedMember ? "public" : "-----",
          command: "elm-helpers.selectWithOffsets",
          arguments: exposedMember
            ? [
                exposedMember["0"],
                exposedMember["0"] + exposedMember["1"].length
              ]
            : lastExposedmember
              ? [
                  lastExposedmember["0"] + lastExposedmember["1"].length,
                  lastExposedmember["0"] + lastExposedmember["1"].length
                ]
              : [0, 0]
        }
      );
    });
    return codeLenses;
  }
}

const getExposedFromSourceCode = (sourceCode: string): [number, string][] => {
  const regexResults = /\(([^]*?)\)/.exec(sourceCode);
  if (!regexResults) {
    return [];
  }
  const exposingContent = regexResults[1];

  const subRegex = /[^\s,]+/g;
  let regexSubResults: RegExpExecArray;
  const output: [number, string][] = [];

  while ((regexSubResults = subRegex.exec(exposingContent))) {
    output.push([
      regexResults.index + regexSubResults.index + 1,
      regexSubResults[0]
    ]);
  }
  return output;
};

const getTypesFromSourceCode = (sourceCode: string): [number, string][] => {
  const regex = /^type\s([A-Z]\S*)/gm;
  let regexResults: RegExpExecArray;
  const output: [number, string][] = [];

  while ((regexResults = regex.exec(sourceCode))) {
    output.push([regexResults.index, regexResults[1]]);
  }
  return output;
};

const getTypeAliasesFromSourceCode = (
  sourceCode: string
): [number, string][] => {
  const regex = /^type\salias\s([A-Z]\S*)/gm;
  let regexResults: RegExpExecArray;
  const output: [number, string][] = [];

  while ((regexResults = regex.exec(sourceCode))) {
    output.push([regexResults.index, regexResults[1]]);
  }
  return output;
};

const getFunctionsFromSourceCode = (sourceCode: string): [number, string][] => {
  const regex = /^(\S*)\s:/gm;
  let regexResults: RegExpExecArray;
  const output: [number, string][] = [];

  while ((regexResults = regex.exec(sourceCode))) {
    output.push([regexResults.index, regexResults[1]]);
  }
  return output;
};
