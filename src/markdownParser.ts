import { type ImageNode, NodeType } from "./main.ts";
import type { Option } from "./utils/types.ts";

export function extractBetween(
  text: string,
  delimiter: string | [string, string],
): Option<string> {
  const startDelimiter = typeof delimiter === "string"
    ? delimiter
    : delimiter[0];
  const endDelimiter = typeof delimiter === "string" ? delimiter : delimiter[1];
  let startIdx = -1;
  let endIdx = -1;
  let openCount = 0;
  let endCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === startDelimiter) {
      if (startIdx < 0) {
        startIdx = i;
      }
      openCount++;
    } else if (text[i] === endDelimiter) {
      endCount++;
    }
    if (openCount > 0 && openCount === endCount) {
      endIdx = i;
      break;
    }
  }
  if (startIdx < 1) {
    return null;
  }
  return text.slice(startIdx + 1, endIdx);
}

export function parseImageNode(text: string): ImageNode {
  const displayText = extractBetween(text, ["[", "]"]);
  if (!displayText) {
    throw new Error("Invalid display text for image");
  }
  const rawHref = extractBetween(text, ["(", ")"]);
  if (!rawHref) {
    throw new Error("Could not parse href for image");
  }
  const [href, ...title] = rawHref.split(" ");
  return {
    type: NodeType.Image,
    href,
    // @TODO: this is so fucking gross omg
    title: !title?.length
      ? undefined
      : title.join(" ").slice(1, title.join(" ").length - 1),
    displayText,
  };
}
