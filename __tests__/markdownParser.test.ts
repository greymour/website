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
  assertEquals(extractBetween("!|some text!|", "|"), "some text!");
});

Deno.test(function parseLineTest() {
  assertEquals(parseLine("this is some text!"), {
    type: NodeType.Paragraph,
    data: [{ attributes: null, data: "this is some text!" }],
  });
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
        data: "text, some ",
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
