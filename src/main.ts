import { parseLine } from "./markdownParser.ts";

async function main() {
  const file = await Deno.readTextFile("./test.md");
  const nodes = file.split("\n").map((line) => parseLine(line));
  console.log("main nodes: ", nodes);
}

main();
