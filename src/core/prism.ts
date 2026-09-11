// Prism core + the languages the Web Performance lessons use. `markup` powers
// `html` (the document the browser parses), `css` covers styling and the render
// path, and `javascript` is the primary scripting language. `bash` covers shell
// commands (curl, npm, build tooling). Plain `text` fences — HTTP headers and
// responses, request waterfalls, console output, and non-highlighted config —
// are left unhighlighted.
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism-tomorrow.css';

export default Prism;
