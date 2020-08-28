import { lexer } from './lexer';

interface IParserConfig {}
export class parser {
  private content: string;
  private config: IParserConfig;
  constructor(content: string, config: IParserConfig) {
    this.content = content;
    this.config = config;
    this.parse();
  }

  parse() {
    return lexer(this.content);
  }
}
