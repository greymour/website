async function main() {
  const file = await Deno.readTextFile("./test.md");
  const nodes = file.split("\n").map((line) => parseLine(line));
  console.log("main nodes: ", nodes);
}

main();

type Option<T> = T | null;

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

type Enum<T> = T[keyof T];

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

type InlineTextNode = {
  attributes: Enum<typeof TextNodeAttributes> | null;
  data: string;
};

type BlockTextNode = Node<
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

type HorizontalRuleNode = Node<typeof NodeType.HorizontalRule>;

type ImageNode = Node<typeof NodeType.Image, {
  href: string;
  displayText?: string;
  title?: string;
}>;

type BlockQuoteNode = Node<typeof NodeType.BlockQuote, {
  data: InlineTextNode[];
}>;

type OrderedListNode = Node<typeof NodeType.OrderedListItem, {
  data: InlineTextNode[];
}>;

type UnorderedListNode = Node<typeof NodeType.UnorderedListItem, {
  data: InlineTextNode[];
}>;

type CodeBlockNode = Node<typeof NodeType.CodeBlock, {
  data: InlineTextNode[];
}>;

type MarkdownNode =
  | BlockTextNode
  | HorizontalRuleNode
  | ImageNode
  | BlockQuoteNode
  | OrderedListNode
  | UnorderedListNode
  | CodeBlockNode;

export function parseInlineTextNode(text: string): InlineTextNode[] {
  return [];
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
      return {
        type: NodeType.CodeBlock,
        data: "",
      };
    case line.startsWith("- "):
      throw new Error("Not yet implemented");
      return {
        type: NodeType.UnorderedListItem,
        data: line.slice(2),
      };
    case typeof line.match(/^[0-9]\. .*$/)?.[0] !== "undefined":
      throw new Error("Not yet implemented");
      return {
        type: NodeType.OrderedListItem,
        data: line.slice(3),
      };
    case line.startsWith("==="):
    case line.startsWith("***"):
    case line.startsWith("___"):
      return {
        type: NodeType.HorizontalRule,
      };
    case line.startsWith("!["):
      throw new Error("Not yet implemented");
      return {
        type: NodeType.Image,
        href: "",
        title: "",
        displayText: "",
      };
    case line.startsWith("> "):
      throw new Error("Not yet implemented");
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
