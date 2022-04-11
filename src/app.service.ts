import { Injectable } from '@nestjs/common';
import { readFile } from 'fs-extra';
import MarkdownIt = require('markdown-it');

@Injectable()
export class AppService {
  public async getDocs(): Promise<string> {
    const doc = await readFile(__dirname + '/docs/docs.md', 'utf8');
    const styles = await readFile(__dirname + '/docs/styles.css', 'utf8');
    const mdParser = MarkdownIt({ html: true });
    const renderedDoc = await mdParser.render(doc);

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Customers Relations Management API | By Darío Scattolini</title>
          <base href="./">
          <style>${styles}</style>
        </head>
        <body>
          ${renderedDoc}
        </body>
      </html>
    `;
  }

  public getMainPage(): string {
    const repoLink = 'https://github.com/darioscattolini/customers-api';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Customers Relations Management API | By Darío Scattolini</title>
          <base href="./">
        </head>
        <body>
          <h1>Customers Relations Management API</h1>
          <p>Developed by Darío Scattolini</p>
          <p><a href=${repoLink}>Find documentation in GitHub Repository</a></p>
        </body>
      </html>
    `;
  }
}
