"use client";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";

type JsonViewerProps = {
  data: unknown;
  className?: string;
};

export function JsonViewerDisplay({ data, className }: JsonViewerProps) {
  return (
    <div className={className}>
      <JsonView
        value={data as object}
        collapsed={3}
        displayDataTypes={true}
        displayObjectSize={true}
        enableClipboard={true}
        indentWidth={10}
        style={githubDarkTheme}
      />
    </div>
  );
}
