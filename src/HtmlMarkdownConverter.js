import Turndown from "turndown"
import { tables as gfmTables } from 'joplin-turndown-plugin-gfm'

export default class HtmlMarkdownConverter {

    convert(html) {
        const turndownService = new Turndown({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*', })
        turndownService.use(gfmTables)
        let markdown = turndownService.turndown(html)

        /**
         * Markdown customizations
         */

        // Remove leftover comments
        markdown = markdown.replace(/(\<!--.*?\-->)/g, "");

        // Bullet points
        markdown = markdown
            .replaceAll(' ', ' ') // Non-breaking space
            .replaceAll('•	', '- ') // Bullet point
            .replaceAll('×', '-') // Bullet multiplication
            .replaceAll('o	', '- ') // Bullet point
            .replaceAll('o   ', '- ') // Bullet point
            .replaceAll('	', '- ') // Bullet point
            // Catch weird word list rendering.
            .replaceAll('·        ', '- ')
            .replaceAll('·       ', '- ')
            .replaceAll('·         ', '- ')
            .replaceAll('·         ', '- ')
            .replaceAll('o   ', '  - ')
            .replaceAll('§  ', '    - ');

        // Remove all pasted references.
        markdown = markdown.replace(/\n\* \* \*\n((.|\n|\r)*)$/, '')

        markdown = markdown.replaceAll((new RegExp('\\[\\\\\\[[0-9a-z]{1,}\\\\\\]\\]\\(([\\S])+\\)([\\s.,:;!?]{1})', 'g')), (match, p1, p2, p3) => {
            return `[^🟠]${p2}`;
        })
        markdown = markdown.replaceAll((new RegExp('\[\\\[[0-9a-z]{1,}\\\]\]\(([^)])+\)', 'g')), '[^🟠]')

        // Use first row as table headers when no header is present
        markdown = markdown.replace(/^\|[ \|]{1,}\|\n\| [ \-\|]{1,}\ \|\n\| [^\n]{1,} \|\n/gm, (match) => {
            // Return the replacement leveraging the parameters.
            const headerArr = match.split("\n")
            if (headerArr.length != 4) return match;
            return [headerArr[2], headerArr[1], headerArr[4]].join("\n")
        });

        return markdown;

    }

}