import { assertEquals } from "@std/assert";
import {
  extractBetween,
  NodeType,
  parseImageNode,
  parseInlineTextNode,
  parseLine,
  TextNodeAttributes,
} from "../src/markdownParser.ts";

Deno.test(function testExtractBetween() {
  assertEquals(extractBetween("![some text!]", ["[", "]"]), "some text!");
  assertEquals(
    extractBetween("![some text!](https://foo-bar.com/something.jpg)", [
      "[",
      "]",
    ]),
    "some text!",
  );
  assertEquals(extractBetween("![some [text]!]", ["[", "]"]), "some [text]!");
  assertEquals(extractBetween("!|some |text|!|", "|"), "some |text|!");
  assertEquals(
    extractBetween("!|some |text|! wow!|", "|"),
    "some |text|! wow!",
  );
  assertEquals(extractBetween("!|some text!|", "|"), "some text!");
  assertEquals(extractBetween("!|some text!| wow!", "|"), "some text!");
  assertEquals(extractBetween("some `code` text", "`"), "code");
  assertEquals(extractBetween("some *italic* text", "*"), "italic");
  assertEquals(
    extractBetween("some **bold** text", "**"),
    "bold",
  );
  assertEquals(
    extractBetween("some ***bold italic*** text", "***"),
    "bold italic",
  );
});

Deno.test(function parseLineTest() {
  assertEquals(parseLine("this is some text!"), {
    type: NodeType.Paragraph,
    data: [{ attributes: null, data: "this is some text!" }],
  });
});

Deno.test(function parseInlineTextNodeItalic() {
  assertEquals(parseInlineTextNode("some normal text, some *italic* text."), [
    {
      attributes: null,
      data: "some normal text, some ",
    },
    {
      attributes: TextNodeAttributes.Italic,
      data: "italic",
    },
    {
      attributes: null,
      data: " text.",
    },
  ]);
});

Deno.test(function parseInlineTextNodeBold() {
  assertEquals(parseInlineTextNode("some normal text, some **bold** text."), [
    {
      attributes: null,
      data: "some normal text, some ",
    },
    {
      attributes: TextNodeAttributes.Bold,
      data: "bold",
    },
    {
      attributes: null,
      data: " text.",
    },
  ]);
});

Deno.test(function parseInlineTextNodeBoldItalic() {
  assertEquals(
    parseInlineTextNode("some normal text, some ***bold italic*** text."),
    [
      {
        attributes: null,
        data: "some normal text, some ",
      },
      {
        attributes: TextNodeAttributes.BoldItalic,
        data: "bold italic",
      },
      {
        attributes: null,
        data: " text.",
      },
    ],
  );
});

Deno.test(function parseInlineTextNodeCode() {
  assertEquals(
    parseInlineTextNode(
      "here's some code: `const sayHello = (name: string) => `Hello ${name}!`;`. Isn't that cool?",
    ),
    [
      {
        attributes: null,
        data: "here's some code: ",
      },
      {
        attributes: TextNodeAttributes.Code,
        data: "const sayHello = (name: string) => `Hello ${name}!`;",
      },
      {
        attributes: null,
        data: ". Isn't that cool?",
      },
    ],
  );
});

Deno.test(function parseInlineTextNodeTest() {
  assertEquals(
    parseInlineTextNode(
      "some normal text, some *italic* text, some **bold** text, some `code` text, and some ***bold italic*** text.",
    ),
    [
      {
        attributes: null,
        data: "some normal text, some ",
      },
      {
        attributes: TextNodeAttributes.Italic,
        data: "italic",
      },
      {
        attributes: null,
        data: " text, some ",
      },
      {
        attributes: TextNodeAttributes.Bold,
        data: "bold",
      },
      {
        attributes: null,
        data: " text, some ",
      },
      {
        attributes: TextNodeAttributes.Code,
        data: "code",
      },
      {
        attributes: null,
        data: " text, and some ",
      },
      {
        attributes: TextNodeAttributes.BoldItalic,
        data: "bold italic",
      },
      {
        attributes: null,
        data: " text.",
      },
    ],
  );
});

Deno.test(function testParseImageNode() {
  assertEquals(
    parseImageNode(
      `![The San Juan Mountains are beautiful!](/assets/images/san-juan-mountains.jpg "San Juan Mountains")`,
    ),
    {
      type: NodeType.Image,
      href: "/assets/images/san-juan-mountains.jpg",
      displayText: "The San Juan Mountains are beautiful!",
      title: "San Juan Mountains",
    },
  );

  assertEquals(
    parseImageNode(
      `![The San Juan Mountains are beautiful!](/assets/images/san-juan-mountains.jpg)`,
    ),
    {
      type: NodeType.Image,
      href: "/assets/images/san-juan-mountains.jpg",
      displayText: "The San Juan Mountains are beautiful!",
      title: undefined,
    },
  );
});
