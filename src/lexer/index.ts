import { Token } from '../Token/index';
import { match } from 'assert';
import * as fs from 'fs';
import { resolve } from 'path';
import { stringify } from 'querystring';
export class Lexer {
  private str: string;
  private tks: Token[] = [];
  private len: number;
  private baseStr = this.str;

  constructor(str: string) {
    this.str = str;
    this.len = str.length;
    this.run();
  }

  run() {
    console.log('run');
    while (this.str.length !== 0) {
      const endTag = this.matchEnd();
      console.log(endTag);
      if (endTag) {
        // TODO handle endtag
        console.log(endTag);
      }

      const startTag = this.matchOpen();
      if (startTag) {
        // TODO handle startTag
      }

      let text = '';

      const idx = this.str.indexOf('<');
      let lBreadIdx = this.str.indexOf('{');
      let rBreadIdx = this.str.indexOf('}');
      const hasJSX: boolean = lBreadIdx < rBreadIdx && (idx === -1 || lBreadIdx < idx);

      if (hasJSX) {
        if (lBreadIdx != 0) {
          text += this.str.slice(0, 1);
          this.str = this.str.slice(1);
          this.addText(text);
        }
      }
    }
  }

  //   collectJSX() {}

  addText(text: string) {}

  matchOpen() {
    if (this.str.indexOf('<') !== 0) {
      return null;
    }
    // 注意处理注释(<!-- --->)
    if (this.str.startsWith('<!--')) {
      let endIdx = this.str.indexOf('-->');
      if (endIdx === -1) throw new Error(`unmatched commit`);
      return [this.str.slice(0, endIdx + 3), { type: '#commit', nodeVal: this.str.slice(4, endIdx) }];
    }
    const matched = this.str.match(/\<(\w[^\s\/\>]*)/);
  }
  matchEnd() {
    if (this.str.indexOf('</') !== 0) {
      return null;
    }
    const matched = this.str.match(/^\<\/(\w+)\>/);
    if (matched) {
      const tag = matched[1];
      this.str.slice(3 + tag.length);
      return [matched[0], { tag: tag }];
    }
  }
}

const jsxSurce: string = fs.readFileSync(resolve(__dirname, './test.jsx')).toString('utf-8');
const lexer = new Lexer(jsxSurce);

lexer.run();
