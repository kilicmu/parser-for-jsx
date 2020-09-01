import { Token } from './../Token/index';
import { RSA_PKCS1_OAEP_PADDING } from 'constants';
export function getText(token: Token) {
  let ret = '';

  token.children.forEach((_) => {
    if (_.tag === '#text') {
      ret += _.tag;
    } else if (_.children) {
      ret += getText(_);
    }
  });

  return ret;
}

export function parseCode(code: string): { str: string; jsx: Token[] } {
  // <div class={()=><div />}>
  let state = 'code',
    idx = 0,
    tmpIdx = 1,
    nodes: Token[] = [];
  for (let i = 0; i < code.length; ++i) {
    const c = code[i],
      peek = code[i + 1];
    switch (state) {
      case 'code':
        if (c === '"' || c === "'") {
          state = 'string';
        } else if (c === '{') {
          tmpIdx++;
        } else if (c === '}') {
          tmpIdx--;
          if (tmpIdx === 0) {
            collectJSX(code, idx, i, nodes);
            return { str: code.slice(idx), jsx: nodes };
          }
        } else if (c === '<') {
          let word = '';
          let index = i - 1;
          let empty = true;
          do {
            const c = code[index];
            if (empty && /\s/.test(c)) {
              continue;
            }

            if (/\s/.test(c)) {
              break;
            }

            word = c + word; // 反向收集
          } while (--index >= 0);
        }
        break;
    }
  }
  return { str: '', jsx: [new Token('#jsx')] };
}

export function makeJSX(jsx: Token) {
  return jsx.tag === '#jsx' ? jsx : (new Token('#jsx').value = jsx);
}

function collectJSX(code: string, idx: number, i: number, nodes: Token[]) {}
