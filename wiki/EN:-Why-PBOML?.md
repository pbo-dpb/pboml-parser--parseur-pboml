PBOML is a YAML-based language designed for publishing structured reports and analyses. It is both human-readable and machine-readable, making it versatile for various use cases.

The PBOML language was designed to meet simple but crucial requirements in the context of an organization producing a large quantity of specialized publications under high time and staffing constraints.

## Target Users

The use of PBOML in publishing operations must be possible for a continuum of three levels of users

- _Administrative staff_: with a one-hour training, with no prior programming experience, to make minor changes (e.g., fixing a typo) via a graphical interface or, very occasionally, directly in a document's source code.
- _Economic/Financial Analysts_: one hour training and prior experience with command line statistical analysis tools and/or script programming (Stata, MATLAB, R, etc.). These users should be able to assist the developer during the publishing process (by manually modifying numbers or text contained in a pre-structured PBOML document).
- _Junior Developer_: advanced training, able to manipulate an entire document based on the documentation and involving analysts in the review/publishing process.

PBOML stands in contrast to other alternative formats that are more difficult to operate without extensive training, such as LaTeX.

## Human and machine readable

In many situations, it is important for the OPBO to have the ability to make bulk changes to documents at publication time. For example, it is crucial to be able to change the publication date of a series of documents or to insert missing data from an external database. These content manipulation processes must be scripted to be performed consistently, without human intervention.

Conversely, it is also useful to be able to use a script to extract data from a document. For example, in the context of OPBO-related publications, it might be useful to extract from a series of costings notes for a single legislative measure the set of costs attributed to it so that a single table could be constructed and automatically kept up to date as publications are made.

Our experience with a permissive markup language, such as HTML, shows us that these manipulations are very difficult to reproduce on a large scale and prone to breaking. As for stricter serialization languages - such as XML or JSON - their ability to remain human readable and editable diminishes very fast.

## No specific software

For operational reasons, the production of the content must be done entirely without the use of specialized software. A browser and, potentially, a plain text editor are all that users need.

This constraint excludes professional editing software from the outset.

## Print and web

The OPBO's analysis products are intended for different media: web and print. While most clients access these documents digitally, a print-ready version (practically speaking a PDF) must be produced for official tabling in Parliament.

In addition to meeting the minimum requirements set by the legislative framework for accessibility and bilingualism, we strive to go beyond these standards whenever possible. For example, web-based versions of documents must be fully responsive (reduced screen size) and file size suitable for viewing on a smartphone with a limited cellular connection. We also make sure to adopt the industry's best practices in terms of accessible Web and metadata, and this in a systematic way.

Unlike a solution that would combine the WYSIWIG HTML editor of a CMS with a word processor, PBOML and its associated tools have been designed to produce the highest quality documents by not prioritizing one of these communication mediums over another.

## Varied content

The nature of the OPBO's work imposes a great variety of content in the published documents: rich text, graphics and tables are legion.

Although PBOML makes extensive use of it in its text slices, the use of a simple markup language (e.g. Markdown) as the only support is too limiting. The use of a predefined structure is also necessary because of the constraint listed earlier of inserting and machine-reading data and metadata in documents.

## Client side

Due to constraints related to the absence of a team dedicated to the Web infrastructure, most of the operations related to the production process must be done on the client side, without using a server.

Thus, the PBOML related tools (the parser, rendering engine and the content editor) are designed to be executed exclusively in a Web browser. PDF generation is possible manually or through the use of a script running on an on-demand cloud solution (e.g. AWS Lambda). 

Finally, because PBOML files are plain text, allowing seamless storage and processing with standard information management software.