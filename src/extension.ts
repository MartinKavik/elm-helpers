import * as vscode from "vscode";
import { FunctionAnnotationsProvider } from "./functionAnnotations";
import { selectWithOffsets } from "./selectWithOffsets";

const ELM_MODE: vscode.DocumentFilter = {
  language: "elm",
  scheme: "file"
};

export function activate(context: vscode.ExtensionContext) {
  console.log("elm-helpers is active!");

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      ELM_MODE,
      new FunctionAnnotationsProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "elm-helpers.selectWithOffsets",
      selectWithOffsets
    )
  );
}

export function deactivate() {}
