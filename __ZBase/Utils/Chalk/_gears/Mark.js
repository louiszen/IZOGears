
/**
 * [!] Special notation for debug message
 */
const Regex = /\[([^\n]?)\]/g;
const Map = {
  '-': ["Gray"],
  'o': ["BrightGreen"],
  'x': ["BrightRed"],
  '!': ["BrightYellow"],
  '>': ["BrightBlue", "Blink"],
  '<': ["Cyan", "Blink"],
  'v': ["BrightMagenta"],
  '*': ["Brightwhite", "Flash"]
}
const DefaultColor = ["BrightCyan", "Bold"];
const DefaultBracketColor = ["Gray"];

module.exports = {
  Regex,
  Map,
  DefaultColor,
  DefaultBracketColor
};