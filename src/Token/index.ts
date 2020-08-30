export class Token {
  private _tag: string;
  private _props: object | null = null;
  private _children: Token[] = [];
  private _value: string | null = null;
  constructor(tag: string) {
    this._tag = tag;
  }

  set value(value: string) {
    this._value = value
  }

  get tag() {
    return this._tag;
  }

  set props(props: object) {
    this._props = props;
  }

  set children(children: Token[]) {
    this._children = this.children;
  }

  addChild(child: Token) {
    this._children.push(child);
  }

  toString() {
    return `{tag: ${this._tag}, props: ${this._props}, children: ${this._children}, value: ${this._value}}`
  }
}
