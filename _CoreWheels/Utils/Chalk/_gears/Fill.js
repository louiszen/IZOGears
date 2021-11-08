/**
 * Fill Color before/after specific pattern
 */
const Fill = [
  {
    keys: ["!!"],
    colors: ["BrightYellow"],
    mode: "after",
    bound: ["bracket", "keyword"]
  },
  {
    keys: [">>"],
    colors: ["BrightBlue", "Blink"],
    mode: "after",
    bound: ["bracket", "keyword"]
  },
  {
    keys: ["<<"],
    colors: ["Cyan", "Blink"],
    mode: "after",
    bound: ["bracket", "keyword"]
  },
  {
    keys: ["::"],
    colors: ["Green"],
    mode: "after",
    bound: ["bracket", "keyword"]
  },
  {
    keys: ["$$"],
    colors: ["BgBlack", "Blue"],
    mode: "before",
    bound: ["bracket", "keyword"]
  }
];

module.exports = Fill;