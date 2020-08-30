import { Token } from './../Token/index';
export function getText(token: Token) {
  let ret = '';

  token.children.forEach(_ => {
    if (_.tag === '#text') {
      ret += _.tag;
    } else if (_.children) {
      ret += getText(_);
    }
  });

  return ret;
}


export function parseCode(code: string) {

  return { str: '', jsx: '' }
}

export function makeJSX(jsx: string) {
  return {};
} 