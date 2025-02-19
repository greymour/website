import { assertEquals } from "@std/assert";
import {
  NodeType,
  parseInlineTextNode,
  parseLine,
  TextNodeAttributes,
} from "./src/main.ts";

const test = Deno.test;

test(function parseLineTest() {
  assertEquals(parseLine("this is some text!"), {
    type: NodeType.Paragraph,
    data: [{ attributes: null, data: "this is some text!" }],
  });
});

test(function parseInlineTextNodeTest() {
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
