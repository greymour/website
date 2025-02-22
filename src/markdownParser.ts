import type { Enum, Option } from "./utils/types.ts";

export const NodeType = {
  HeadingOne: "HeadingOne",
  HeadingTwo: "HeadingTwo",
  HeadingThree: "HeadingThree",
  HeadingFour: "HeadingFour",
  HeadingFive: "HeadingFive",
  HeadingSix: "HeadingSix",
  Paragraph: "Paragraph",
  OrderedListItem: "OrderedListItem",
  UnorderedListItem: "UnorderedListItem",
  HorizontalRule: "HorizontalRule",
  CodeBlock: "CodeBlock",
  Image: "Image",
  BlockQuote: "BlockQuote",
} as const;

export function extractBetween(
  text: string,
  delimiter: string | [string, string],
): Option<string> {
  const startDelimiter = typeof delimiter === "string"
    ? delimiter
    : delimiter[0];
  const endDelimiter = typeof delimiter === "string" ? delimiter : delimiter[1];
  const start = text.indexOf(startDelimiter);
  const end = text.lastIndexOf(endDelimiter);
  return text.slice(start + startDelimiter.length, end);
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

type Node<
  Type extends Enum<typeof NodeType>,
  Data extends (Record<string, unknown> | undefined) = undefined,
> = Data extends undefined ? { type: Type } : { type: Type } & Data;

export const TextNodeAttributes = {
  Bold: "Bold",
  Italic: "Italic",
  Code: "Code",
  BoldItalic: "BoldItalic",
} as const;

export type InlineTextNode = {
  attributes: Option<Enum<typeof TextNodeAttributes>>;
  data: string;
};

export type BlockTextNode = Node<
  Enum<
    Pick<
      typeof NodeType,
      | "HeadingOne"
      | "HeadingTwo"
      | "HeadingThree"
      | "HeadingFour"
      | "HeadingFive"
      | "HeadingSix"
      | "Paragraph"
    >
  >,
  { data: InlineTextNode[] }
>;

export type HorizontalRuleNode = Node<typeof NodeType.HorizontalRule>;

export type ImageNode = Node<typeof NodeType.Image, {
  href: string;
  displayText?: string;
  title?: string;
}>;

export type BlockQuoteNode = Node<typeof NodeType.BlockQuote, {
  data: InlineTextNode[];
}>;

export type OrderedListNode = Node<typeof NodeType.OrderedListItem, {
  data: InlineTextNode[];
}>;

export type UnorderedListNode = Node<typeof NodeType.UnorderedListItem, {
  data: InlineTextNode[];
}>;

export type CodeBlockNode = Node<typeof NodeType.CodeBlock, {
  data: InlineTextNode[];
}>;

export type MarkdownNode =
  | BlockTextNode
  | HorizontalRuleNode
  | ImageNode
  | BlockQuoteNode
  | OrderedListNode
  | UnorderedListNode
  | CodeBlockNode;

export function parseInlineCodeNode(text: string): string {
  let openCount = 0;
  let closeCount = 0;
  let left = 0;
  let right = text.length - 1;
  while ((openCount < 1 || closeCount < 1) && left < right) {
    if (text[left] === "`") {
      openCount++;
    } else {
      left++;
    }
    if (text[right] === "`") {
      closeCount++;
    } else {
      right--;
    }
  }
  // the +1 here is to strip the backtick delimiter out
  return text.slice(left + 1, right);
}

function getDelimiter(text: string, i: number): Option<string> {
  const char = text[i];
  const next = text[i + 1];
  const nextNext = text[i + 2];
  let delimiter = null;
  if (char === "*" && next === "*" && nextNext === "*") {
    delimiter = "***";
  } else if (char === "*" && next === "*") {
    delimiter = "**";
  } else if (char === "*") {
    delimiter = "*";
  } else if (char === "`") {
    delimiter = "`";
  }
  return delimiter;
}

// @TODO: refactor this, this is so gross and hard to read
export function parseInlineTextNode(text: string): InlineTextNode[] {
  const nodes: InlineTextNode[] = [];
  let i = 0;
  let data = "";
  while (i < text.length) {
    const char = text[i];
    const delimiter = getDelimiter(text, i);
    if (delimiter) {
      nodes.push({
        attributes: null,
        data,
      });
      let attributes = delimiter === "***"
        ? TextNodeAttributes.BoldItalic
        : delimiter == "**"
        ? TextNodeAttributes.Bold
        : delimiter === "*"
        ? TextNodeAttributes.Italic
        : delimiter === "`"
        ? TextNodeAttributes.Code
        : null;

      data = "";
      if (attributes === TextNodeAttributes.Code) {
        data = parseInlineCodeNode(text.slice(i));
      } else {
        for (let k = i + delimiter.length; k < text.length; k++) {
          if (text.slice(k, k + delimiter.length) === delimiter) {
            break;
          }
          data += text[k];
        }
      }

      nodes.push({
        attributes,
        data,
      });
      i += data.length;
      i += delimiter.length * 2;
      attributes = null;
      data = "";
    } else {
      data += char;
      i++;
    }
  }
  if (data) {
    nodes.push({
      attributes: null,
      data,
    });
  }
  return nodes;
}

export function parseLine(line: string): Option<MarkdownNode> {
  switch (true) {
    case line.startsWith("# "):
      return {
        type: NodeType.HeadingOne,
        data: parseInlineTextNode(line.slice(2)),
      };
    case line.startsWith("## "):
      return {
        type: NodeType.HeadingTwo,
        data: parseInlineTextNode(line.slice(3)),
      };
    case line.startsWith("### "):
      return {
        type: NodeType.HeadingThree,
        data: parseInlineTextNode(line.slice(4)),
      };
    case line.startsWith("#### "):
      return {
        type: NodeType.HeadingFour,
        data: parseInlineTextNode(line.slice(5)),
      };
    case line.startsWith("##### "):
      return {
        type: NodeType.HeadingFive,
        data: parseInlineTextNode(line.slice(6)),
      };
    case line.startsWith("###### "):
      return {
        type: NodeType.HeadingSix,
        data: parseInlineTextNode(line.slice(7)),
      };
    case line.startsWith("```"):
      throw new Error("Not yet implemented");
      // return {
      //   type: NodeType.CodeBlock,
      //   data: "",
      // };
    case line.startsWith("- "):
      return {
        type: NodeType.UnorderedListItem,
        data: parseInlineTextNode(line.slice(2)),
      };
    case typeof line.match(/^[0-9]\. .*$/)?.[0] !== "undefined":
      return {
        type: NodeType.OrderedListItem,
        data: parseInlineTextNode(line.slice(3)),
      };
    case line.startsWith("==="):
    case line.startsWith("***"):
    case line.startsWith("___"):
      return {
        type: NodeType.HorizontalRule,
      };
    case line.startsWith("!["):
      return parseImageNode(line);
    case line.startsWith("> "):
      return {
        type: NodeType.BlockQuote,
        data: parseInlineTextNode(line.slice(2)),
      };
    default:
      return {
        type: NodeType.Paragraph,
        data: parseInlineTextNode(line),
      };
  }
}
