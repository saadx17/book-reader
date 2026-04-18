# Book Reader

A lightweight, customizable web-based book reader. It dynamically loads book data from JSON files and renders chapters written in Markdown.
## Project Structure

```text
book-reader/
├── data/
│   ├── book.json       # Example book metadata and chapter list
│   └── book-ch1.md     # Example chapter content in Markdown
├── scripts/
│   └── book-reader.js   # Application logic
├── styles/
│   └── book-reader.css  # Application styling
└── index.html           # Main entry point
```

## Usage

1. Serve the project files using a local web server to avoid CORS issues when fetching data.
2. Open `index.html` in your browser.
3. To load a specific book, use the `book` query parameter in the URL. For example: `index.html?book=book`. The app will look for a file named `book.json` in the `data/` directory.

## Book JSON Format

To add a new book, create a JSON file in the `data/` directory with the following structure:

```json
{
  "title": "Book Title",
  "chapters": [
    {
      "title": "Chapter 1 Title",
      "subtitle": "Optional subtitle",
      "file": "chapter1.md"
    },
    {
      "title": "Chapter 2",
      "content": "<p>Fallback HTML content if no file is provided.</p>"
    }
  ]
}
```
