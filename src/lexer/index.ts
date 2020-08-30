import { Token } from './../Token/index';
import { match } from 'assert';
import * as fs from 'fs';
import { resolve } from 'path';
import { UnMatchedError } from '../Errors/UnMatchedError';
import { getText, makeJSX, parseCode } from '../common/utils';

export class Lexer {
  private str: string;
  private tks: Token[] = [];
  private len: number;
  private baseStr: string;
  private stack: Token[] = [];
  private ast: any;

  constructor(str: string) {
    this.str = this.baseStr = str;
    this.len = str.length;
    this.run();
  }

  run() {
    let lastNode = null;
    while (this.str.length !== 0) {
      if (this.str.startsWith('</')) {
        // TODO handle endtag
        const closeToken = this.handleEndTag();
        const token = this.stack.pop();
        if (token) {
          if (token.tag === 'option') {
            const t = new Token('#text');
            t.value = getText(token);
            token.children = [t];
          } else if (token.tag === 'table') {
            // TODO to handle table tag
          }
        } else {
          // cant match this close tag
          // @ts-ignore 
          throw UnMatchedError.forTag(token.tag);
        }
        lastNode = null;
        if (!this.stack.length) {
          // end match -> ast;
          return;
        }
        continue;
      }

      if (this.str.startsWith('<')) {
        // TODO handle startTag
        const startToken = this.handleStartTag();
      }

      //   let text = '';

      //   const idx = this.str.indexOf('<');
      //   let lBreadIdx = this.str.indexOf('{');
      //   let rBreadIdx = this.str.indexOf('}');
      //   const hasJSX: boolean = lBreadIdx < rBreadIdx && (idx === -1 || lBreadIdx < idx);

      //   if (hasJSX) {
      //     if (lBreadIdx != 0) {
      //       text += this.str.slice(0, 1);
      //       this.str = this.str.slice(1);
      //       this.addText(text);
      //     }
      //   }
    }
  }

  //   collectJSX() {}

  addText(text: string) { }

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

  handleEndTag() {
    if (!this.str.startsWith('</')) {
      return null;
    }
    const matched = this.str.match(/^\<\/(\w+)\s*\>/)
    if (matched) {
      const ret = new Token(matched[1]);
      this.str.slice(matched[0].length);
      return ret;
    }
  }

  handleStartTag() {
    if (!this.str.startsWith('<')) {
      return;
    }

    if (this.str.startsWith('<!--')) {
      // parse comments;
      return this.handleComments();
    }

    // handle start tag
    const matched = this.str.match(/<(\w[^\s\/\>]*)/);
    if (matched) {
      const startContent = matched[0];
      const tag = matched[1];
      const token = new Token(tag);
      this.str = this.str.slice(startContent.length);
      const matchedProps = this.handleAttrs();
      const props = this.handleAttrs();

    }
  }

  handleComments() {
    const closeIdx = this.str.indexOf('-->');
    if (closeIdx === -1) {
      throw UnMatchedError.forComments(this.str.slice(0, 74));
    }

    const token = new Token('#comment');
    token.value = this.str.slice(4, closeIdx);
    this.str = this.str.slice(closeIdx + 3);
    return token;
  }

  handleAttrs() {
    let state = 'AttrNameOrJSX'
    const props: any = {};
    let attrName = '',
      quote = '',
      escape = false,
      attrVal = '';
    for (let i = 0; i < this.str.length; ++i) {
      const c = this.str[i];
      // use c to judge current state
      switch (state) {
        case 'AttrNameOrJSX': // 收集attr name
          if (c === '/' || c === '>')
            return props;
          if (/\s/.test(c)) {
            if (attrName) {
              state = 'AttrEqual'; // 读取‘=’
            }
          } else if (c === '=') { // 状态切换，值收集
            if (!attrName) {
              throw UnMatchedError.forAttrKey(c);
            }
            state = 'AttrQuoteOrJSX'; // 处理 " ‘ { 情况
          } else if (c === '{') {
            state = 'spreadJSX';
          } else {
            attrName += c;
          }
          break;
        case 'AttrEqual':
          if (c === '=') { // 处理值
            state = 'AttrQuoteOrJSX';
          }
          break;
        case 'AttrQuoteOrJSX':
          if (c === '"' || c === "'") {
            quote = c;
            state = 'AttrVal';
            escape = false;
          } else if (c === '{') {
            state = 'JSX';
          }
          break;
        case 'AttrVal':
          if (c === '\\') {
            escape = !escape;
          }

          if (c !== quote) {
            attrVal += c;
          } else if (c === quote && !escape) {
            props[attrName] = attrVal;
            state = 'AttrNameOrJSX';
          }
          break;

        case 'SpreadJSX': // 扩展运算符
          i += 3;
        case 'JSX':
          const { str, jsx } = parseCode(this.str.slice(i))
          i += str.length;

          props[state === 'SpreadJSX' ? 'spreadAttribute' : attrName] = makeJSX(jsx);

          attrName = attrVal = '';

          state = 'AttrNameOrJSX';
          break;
        default:
          break;
      }
    }
    throw 'unexpect end';
  }

}

const jsxSurce: string = fs.readFileSync(resolve(__dirname, './test.jsx')).toString('utf-8');
const lexer = new Lexer(jsxSurce);

lexer.run();
