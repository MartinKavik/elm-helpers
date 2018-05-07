import * as vscode from "vscode";
import { Selection } from "vscode";

export const selectWithOffsets = (offsetStart: number, offsetEnd: number) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const selectStart = editor.document.positionAt(offsetStart);
  const selectEnd = editor.document.positionAt(offsetEnd);
  editor.selection = new Selection(selectStart, selectEnd);
  editor.revealRange(editor.selection);
};
