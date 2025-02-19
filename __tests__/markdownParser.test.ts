import { assertEquals } from "@std/assert";
import { NodeType } from "../src/main.ts";
import { extractBetween, parseImageNode } from "../src/markdownParser.ts";

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
